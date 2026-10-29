const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get assigned deliveries for the logged-in user / driver or all active deliveries
// @route   GET /api/deliveries
// @access  Private (Driver, Fleet Manager, Admin)
const getAssignedDeliveries = async (req, res, next) => {
  try {
    const query = {};

    // If logged in as driver, filter by their driver profile
    if (req.user.role === 'driver') {
      let driverDoc = null;
      if (req.user.driverProfile) {
        driverDoc = await Driver.findById(req.user.driverProfile);
      } else {
        driverDoc = await Driver.findOne({ email: req.user.email });
      }

      if (driverDoc) {
        query.driver = driverDoc._id;
      } else {
        // Driver profile not yet linked, return empty list cleanly
        return res.json({
          success: true,
          count: 0,
          deliveries: [],
        });
      }
    } else if (req.query.driverId) {
      query.driver = req.query.driverId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const deliveries = await Shipment.find(query)
      .populate('vehicle', 'registrationNumber brand model vehicleType currentMileage')
      .populate('driver', 'name phone licenseNumber status')
      .sort('-createdDate');

    res.json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver updates delivery status & notes
// @route   PATCH /api/deliveries/:id/update-status
// @access  Private (Driver, Fleet Manager, Admin)
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, deliveryNotes, recipientSignedBy } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found.',
      });
    }

    // Role check: If driver, verify they are assigned to this shipment
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({
        $or: [{ _id: req.user.driverProfile }, { email: req.user.email }],
      });
      if (
        !driver ||
        !shipment.driver ||
        shipment.driver.toString() !== driver._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this delivery.',
        });
      }
    }

    const validStatuses = [
      'Assigned',
      'Picked Up',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    shipment.status = status;
    if (deliveryNotes) shipment.deliveryNotes = deliveryNotes;
    if (recipientSignedBy) shipment.recipientSignedBy = recipientSignedBy;

    shipment.timeline.push({
      status,
      timestamp: new Date(),
      note: deliveryNotes || `Delivery status changed to ${status}`,
      updatedBy: req.user.name,
    });

    // Real backend state synchronization
    if (status === 'Delivered') {
      shipment.actualDeliveryDate = new Date();

      if (shipment.vehicle) {
        await Vehicle.findByIdAndUpdate(shipment.vehicle, {
          status: 'Available',
        });
      }

      if (shipment.driver) {
        await Driver.findByIdAndUpdate(shipment.driver, {
          status: 'Available',
        });
      }

      await createNotification({
        title: `Delivery Completed: #${shipment.shipmentId}`,
        message: `Consignment delivered by ${req.user.name}. Recipient acknowledgement: ${
          recipientSignedBy || 'Verified at destination'
        }.`,
        type: 'success',
        category: 'delivery',
        relatedId: shipment._id.toString(),
        entityModel: 'Shipment',
      });
    } else if (['Picked Up', 'In Transit', 'Out for Delivery'].includes(status)) {
      if (shipment.vehicle) {
        await Vehicle.findByIdAndUpdate(shipment.vehicle, {
          status: 'In Transit',
        });
      }
      if (shipment.driver) {
        await Driver.findByIdAndUpdate(shipment.driver, {
          status: 'On Trip',
        });
      }
    }

    await shipment.save();

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('vehicle', 'registrationNumber brand model')
      .populate('driver', 'name phone');

    res.json({
      success: true,
      message: `Delivery updated to status '${status}'. Fleet status synchronized.`,
      shipment: updatedShipment,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssignedDeliveries,
  updateDeliveryStatus,
};

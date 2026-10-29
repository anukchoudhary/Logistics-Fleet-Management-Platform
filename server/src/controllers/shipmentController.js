const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all shipments with search, filtering, and pagination
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      startDate,
      endDate,
      sortBy = 'createdDate',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { pickupAddress: { $regex: search, $options: 'i' } },
        { deliveryAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdDate = {};
      if (startDate) query.createdDate.$gte = new Date(startDate);
      if (endDate) query.createdDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Shipment.countDocuments(query);

    const shipments = await Shipment.find(query)
      .populate('vehicle', 'registrationNumber brand model vehicleType status')
      .populate('driver', 'name phone licenseNumber status')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: shipments.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      shipments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single shipment with full details and timeline
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('vehicle', 'registrationNumber brand model vehicleType capacity currentMileage status')
      .populate('driver', 'name phone email licenseNumber experience status');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    res.json({
      success: true,
      shipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new shipment
// @route   POST /api/shipments
// @access  Private (Admin, Fleet Manager)
const createShipment = async (req, res, next) => {
  try {
    const {
      shipmentId,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageWeight,
      vehicle,
      driver,
      priority,
      expectedDeliveryDate,
    } = req.body;

    const existing = await Shipment.findOne({ shipmentId: shipmentId.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Shipment ID already exists.',
      });
    }

    const initialStatus = vehicle && driver ? 'Assigned' : 'Pending';

    const shipment = await Shipment.create({
      shipmentId,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      packageDescription,
      packageWeight,
      vehicle: vehicle || null,
      driver: driver || null,
      priority: priority || 'Standard',
      expectedDeliveryDate,
      status: initialStatus,
      timeline: [
        {
          status: 'Order Created',
          timestamp: new Date(),
          note: `Shipment order booked for ${customerName}.`,
          updatedBy: req.user.name,
        },
        ...(initialStatus === 'Assigned'
          ? [
              {
                status: 'Assigned',
                timestamp: new Date(),
                note: 'Vehicle and driver assigned.',
                updatedBy: req.user.name,
              },
            ]
          : []),
      ],
    });

    if (vehicle) {
      await Vehicle.findByIdAndUpdate(vehicle, { status: 'In Transit' });
    }
    if (driver) {
      await Driver.findByIdAndUpdate(driver, { status: 'On Trip' });
    }

    await createNotification({
      title: `New Shipment Booked: #${shipment.shipmentId}`,
      message: `Shipment #${shipment.shipmentId} created for ${customerName} to ${deliveryAddress}.`,
      type: 'info',
      category: 'shipment',
      relatedId: shipment._id.toString(),
      entityModel: 'Shipment',
    });

    res.status(201).json({
      success: true,
      shipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update shipment details / assignment
// @route   PUT /api/shipments/:id
// @access  Private (Admin, Fleet Manager)
const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    const oldVehicle = shipment.vehicle;
    const oldDriver = shipment.driver;

    const { vehicle, driver, status, priority, deliveryNotes, ...rest } = req.body;

    // Check if new vehicle or driver assigned
    const updateData = { ...rest, priority, deliveryNotes };

    if (vehicle !== undefined) updateData.vehicle = vehicle || null;
    if (driver !== undefined) updateData.driver = driver || null;

    if (status && status !== shipment.status) {
      updateData.status = status;
      shipment.timeline.push({
        status,
        timestamp: new Date(),
        note: req.body.timelineNote || `Status updated to ${status}`,
        updatedBy: req.user.name,
      });
    }

    // Assigning vehicle & driver when was pending
    if (shipment.status === 'Pending' && (vehicle || driver)) {
      updateData.status = 'Assigned';
      shipment.timeline.push({
        status: 'Assigned',
        timestamp: new Date(),
        note: 'Fleet assignment confirmed by logistics dispatch.',
        updatedBy: req.user.name,
      });
    }

    const updatedShipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { $set: updateData, timeline: shipment.timeline },
      { new: true, runValidators: true }
    )
      .populate('vehicle')
      .populate('driver');

    // Handle vehicle status transitions
    if (status === 'Delivered' || status === 'Cancelled') {
      if (oldVehicle) await Vehicle.findByIdAndUpdate(oldVehicle, { status: 'Available' });
      if (oldDriver) await Driver.findByIdAndUpdate(oldDriver, { status: 'Available' });
    } else if (['Picked Up', 'In Transit', 'Out for Delivery'].includes(status)) {
      if (updatedShipment.vehicle) {
        await Vehicle.findByIdAndUpdate(updatedShipment.vehicle, { status: 'In Transit' });
      }
      if (updatedShipment.driver) {
        await Driver.findByIdAndUpdate(updatedShipment.driver, { status: 'On Trip' });
      }
    }

    res.json({
      success: true,
      shipment: updatedShipment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update shipment status & record timeline entry
// @route   PATCH /api/shipments/:id/status
// @access  Private
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { status, note, recipientSignedBy } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    shipment.status = status;
    if (recipientSignedBy) {
      shipment.recipientSignedBy = recipientSignedBy;
    }

    shipment.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status progressed to ${status}`,
      updatedBy: req.user.name,
    });

    if (status === 'Delivered') {
      shipment.actualDeliveryDate = new Date();
      // Free up assigned vehicle and driver in backend logic
      if (shipment.vehicle) {
        await Vehicle.findByIdAndUpdate(shipment.vehicle, { status: 'Available' });
      }
      if (shipment.driver) {
        await Driver.findByIdAndUpdate(shipment.driver, { status: 'Available' });
      }

      await createNotification({
        title: `Shipment Delivered: #${shipment.shipmentId}`,
        message: `Consignment #${shipment.shipmentId} successfully delivered to ${shipment.customerName}.`,
        type: 'success',
        category: 'delivery',
        relatedId: shipment._id.toString(),
        entityModel: 'Shipment',
      });
    } else if (status === 'In Transit' || status === 'Out for Delivery') {
      if (shipment.vehicle) {
        await Vehicle.findByIdAndUpdate(shipment.vehicle, { status: 'In Transit' });
      }
      if (shipment.driver) {
        await Driver.findByIdAndUpdate(shipment.driver, { status: 'On Trip' });
      }
    } else if (status === 'Cancelled') {
      if (shipment.vehicle) {
        await Vehicle.findByIdAndUpdate(shipment.vehicle, { status: 'Available' });
      }
      if (shipment.driver) {
        await Driver.findByIdAndUpdate(shipment.driver, { status: 'Available' });
      }
    }

    await shipment.save();

    const populated = await Shipment.findById(shipment._id)
      .populate('vehicle')
      .populate('driver');

    res.json({
      success: true,
      shipment: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private (Admin)
const deleteShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    if (['In Transit', 'Out for Delivery'].includes(shipment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete shipment currently in transit.',
      });
    }

    await shipment.deleteOne();

    res.json({
      success: true,
      message: `Shipment #${shipment.shipmentId} deleted.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
};

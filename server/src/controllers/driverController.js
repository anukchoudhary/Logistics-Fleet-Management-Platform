const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all drivers with filtering, search, and pagination
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res, next) => {
  try {
    const {
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { driverId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Driver.countDocuments(query);

    const drivers = await Driver.find(query)
      .populate('assignedVehicle', 'registrationNumber brand model vehicleType status')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: drivers.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      drivers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get driver by ID with delivery history
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate(
      'assignedVehicle',
      'registrationNumber brand model vehicleType capacity currentMileage status'
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    // Delivery history for driver
    const deliveries = await Shipment.find({ driver: driver._id })
      .populate('vehicle', 'registrationNumber brand model')
      .sort('-createdDate')
      .limit(20);

    const completedCount = await Shipment.countDocuments({
      driver: driver._id,
      status: 'Delivered',
    });

    const activeCount = await Shipment.countDocuments({
      driver: driver._id,
      status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
    });

    res.json({
      success: true,
      driver,
      deliveries,
      stats: {
        completedDeliveries: completedCount,
        activeDeliveries: activeCount,
        totalDeliveries: deliveries.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private (Admin, Fleet Manager)
const createDriver = async (req, res, next) => {
  try {
    const {
      driverId,
      name,
      phone,
      email,
      licenseNumber,
      licenseExpiry,
      experience,
      assignedVehicle,
      status,
      joiningDate,
      emergencyContact,
    } = req.body;

    const existingDriver = await Driver.findOne({
      $or: [
        { driverId: driverId.toUpperCase() },
        { licenseNumber: licenseNumber.toUpperCase() },
      ],
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID or License Number already exists.',
      });
    }

    const driver = await Driver.create({
      driverId,
      name,
      phone,
      email,
      licenseNumber,
      licenseExpiry,
      experience,
      assignedVehicle: assignedVehicle || null,
      status: status || 'Available',
      joiningDate: joiningDate || Date.now(),
      emergencyContact,
    });

    // If a vehicle was assigned, link it reciprocally
    if (assignedVehicle) {
      await Vehicle.findByIdAndUpdate(assignedVehicle, { assignedDriver: driver._id });
    }

    await createNotification({
      title: `Driver Onboarded: ${driver.name}`,
      message: `Commercial driver ${driver.name} (License: ${driver.licenseNumber}) added to fleet directory.`,
      type: 'info',
      category: 'system',
      relatedId: driver._id.toString(),
      entityModel: 'Driver',
    });

    res.status(201).json({
      success: true,
      driver,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Admin, Fleet Manager)
const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    const previousVehicle = driver.assignedVehicle;
    const newVehicle = req.body.assignedVehicle;

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignedVehicle', 'registrationNumber brand model');

    // Handle reciprocal vehicle updates if assignedVehicle changed
    if (newVehicle !== undefined && String(previousVehicle) !== String(newVehicle)) {
      if (previousVehicle) {
        await Vehicle.findByIdAndUpdate(previousVehicle, { assignedDriver: null });
      }
      if (newVehicle) {
        await Vehicle.findByIdAndUpdate(newVehicle, { assignedDriver: driver._id });
      }
    }

    res.json({
      success: true,
      driver: updatedDriver,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private (Admin)
const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    // Check if driver has active shipments
    const activeShipment = await Shipment.findOne({
      driver: driver._id,
      status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
    });

    if (activeShipment) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete driver. Currently assigned to active shipment #${activeShipment.shipmentId}.`,
      });
    }

    if (driver.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicle, { assignedDriver: null });
    }

    await driver.deleteOne();

    res.json({
      success: true,
      message: `Driver ${driver.name} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign vehicle to driver
// @route   PATCH /api/drivers/:id/assign-vehicle
// @access  Private (Admin, Fleet Manager)
const assignVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.',
      });
    }

    // Unassign old vehicle if any
    if (driver.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicle, { assignedDriver: null });
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      driver.assignedVehicle = vehicleId;
      await driver.save();
      vehicle.assignedDriver = driver._id;
      await vehicle.save();
    } else {
      driver.assignedVehicle = null;
      await driver.save();
    }

    const updated = await Driver.findById(driver._id).populate('assignedVehicle');

    res.json({
      success: true,
      driver: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
};

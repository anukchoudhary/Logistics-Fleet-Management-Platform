const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const Shipment = require('../models/Shipment');
const FuelRecord = require('../models/FuelRecord');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all vehicles with filtering, searching, sorting, and pagination
// @route   GET /api/vehicles
// @access  Private (Admin, Fleet Manager, Driver)
const getVehicles = async (req, res, next) => {
  try {
    const {
      search,
      status,
      vehicleType,
      fuelType,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { vehicleId: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Vehicle.countDocuments(query);

    const vehicles = await Vehicle.find(query)
      .populate('assignedDriver', 'name phone licenseNumber status')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: vehicles.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      vehicles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get vehicle by ID with history
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      'assignedDriver',
      'name phone email licenseNumber experience status'
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    // Fetch related records concurrently
    const [maintenanceHistory, recentShipments, recentFuel] = await Promise.all([
      Maintenance.find({ vehicle: vehicle._id }).sort('-serviceDate').limit(10),
      Shipment.find({ vehicle: vehicle._id }).populate('driver', 'name phone').sort('-createdDate').limit(10),
      FuelRecord.find({ vehicle: vehicle._id }).sort('-date').limit(10),
    ]);

    res.json({
      success: true,
      vehicle,
      maintenanceHistory,
      recentShipments,
      recentFuel,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin, Fleet Manager)
const createVehicle = async (req, res, next) => {
  try {
    const {
      vehicleId,
      registrationNumber,
      vehicleType,
      brand,
      model,
      manufacturingYear,
      capacity,
      fuelType,
      currentMileage,
      status,
      insuranceExpiry,
      pucExpiry,
      lastServiceDate,
      nextServiceDate,
      assignedDriver,
    } = req.body;

    const existingId = await Vehicle.findOne({
      $or: [
        { vehicleId: vehicleId.toUpperCase() },
        { registrationNumber: registrationNumber.toUpperCase() },
      ],
    });

    if (existingId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID or Registration Number already exists.',
      });
    }

    const vehicle = await Vehicle.create({
      vehicleId,
      registrationNumber,
      vehicleType,
      brand,
      model,
      manufacturingYear,
      capacity,
      fuelType,
      currentMileage: currentMileage || 0,
      status: status || 'Available',
      insuranceExpiry,
      pucExpiry,
      lastServiceDate,
      nextServiceDate,
      assignedDriver: assignedDriver || null,
    });

    await createNotification({
      title: `New Vehicle Added: ${vehicle.registrationNumber}`,
      message: `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber}) has been added to the fleet.`,
      type: 'info',
      category: 'system',
      relatedId: vehicle._id.toString(),
      entityModel: 'Vehicle',
    });

    res.status(201).json({
      success: true,
      vehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin, Fleet Manager)
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    const oldStatus = vehicle.status;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name phone');

    // Notify if status changed to Maintenance
    if (req.body.status && req.body.status !== oldStatus && req.body.status === 'Maintenance') {
      await createNotification({
        title: `Vehicle Under Maintenance: ${vehicle.registrationNumber}`,
        message: `Vehicle ${vehicle.registrationNumber} status changed to Under Maintenance.`,
        type: 'warning',
        category: 'maintenance',
        relatedId: vehicle._id.toString(),
        entityModel: 'Vehicle',
      });
    }

    res.json({
      success: true,
      vehicle: updatedVehicle,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    // Check if vehicle has active shipments
    const activeShipment = await Shipment.findOne({
      vehicle: vehicle._id,
      status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
    });

    if (activeShipment) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle. It is currently engaged in active shipment #${activeShipment.shipmentId}.`,
      });
    }

    await vehicle.deleteOne();

    res.json({
      success: true,
      message: `Vehicle ${vehicle.registrationNumber} removed successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get vehicle summary counts
// @route   GET /api/vehicles/stats/summary
// @access  Private
const getVehicleStats = async (req, res, next) => {
  try {
    const [total, available, inTransit, maintenance, inactive] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'Available' }),
      Vehicle.countDocuments({ status: 'In Transit' }),
      Vehicle.countDocuments({ status: 'Maintenance' }),
      Vehicle.countDocuments({ status: 'Inactive' }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        available,
        inTransit,
        maintenance,
        inactive,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
};

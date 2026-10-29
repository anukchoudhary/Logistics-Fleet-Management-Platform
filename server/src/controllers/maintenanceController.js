const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all maintenance records with filtering and pagination
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRecords = async (req, res, next) => {
  try {
    const {
      vehicleId,
      status,
      serviceType,
      startDate,
      endDate,
      sortBy = 'serviceDate',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (vehicleId) query.vehicle = vehicleId;
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate);
      if (endDate) query.serviceDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Maintenance.countDocuments(query);

    const records = await Maintenance.find(query)
      .populate('vehicle', 'registrationNumber brand model vehicleType status currentMileage')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate(
      'vehicle',
      'registrationNumber brand model vehicleType capacity currentMileage status'
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new maintenance record
// @route   POST /api/maintenance
// @access  Private (Admin, Fleet Manager)
const createMaintenanceRecord = async (req, res, next) => {
  try {
    const {
      vehicle,
      serviceType,
      serviceDate,
      description,
      cost,
      workshop,
      nextServiceDate,
      status,
      odometerAtService,
      invoiceNumber,
    } = req.body;

    const record = await Maintenance.create({
      vehicle,
      serviceType,
      serviceDate: serviceDate || new Date(),
      description,
      cost: Number(cost),
      workshop,
      nextServiceDate,
      status: status || 'Scheduled',
      odometerAtService: odometerAtService ? Number(odometerAtService) : undefined,
      invoiceNumber,
    });

    // Update the vehicle's service dates and status
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (vehicleDoc) {
      vehicleDoc.nextServiceDate = nextServiceDate;
      if (status === 'Completed') {
        vehicleDoc.lastServiceDate = serviceDate || new Date();
        vehicleDoc.status = 'Available';
      } else if (status === 'In Progress') {
        vehicleDoc.status = 'Maintenance';
      }
      await vehicleDoc.save();
    }

    await createNotification({
      title: `Maintenance Logged: ${vehicleDoc?.registrationNumber || 'Vehicle'}`,
      message: `${serviceType} scheduled at ${workshop} for ${vehicleDoc?.registrationNumber}.`,
      type: status === 'In Progress' ? 'warning' : 'info',
      category: 'maintenance',
      relatedId: record._id.toString(),
      entityModel: 'Maintenance',
    });

    const populated = await Maintenance.findById(record._id).populate('vehicle');

    res.status(201).json({
      success: true,
      record: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (Admin, Fleet Manager)
const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
    }

    const { status, nextServiceDate, serviceDate, cost, ...rest } = req.body;
    const updateData = { ...rest };

    if (status) updateData.status = status;
    if (nextServiceDate) updateData.nextServiceDate = nextServiceDate;
    if (serviceDate) updateData.serviceDate = serviceDate;
    if (cost !== undefined) updateData.cost = Number(cost);

    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('vehicle');

    // Update vehicle dates & status if completed or in progress
    if (updated.vehicle) {
      const vehicleDoc = await Vehicle.findById(updated.vehicle._id);
      if (vehicleDoc) {
        if (nextServiceDate) vehicleDoc.nextServiceDate = nextServiceDate;
        if (status === 'Completed') {
          vehicleDoc.lastServiceDate = serviceDate || new Date();
          // If vehicle was marked Maintenance, restore to Available
          if (vehicleDoc.status === 'Maintenance') {
            vehicleDoc.status = 'Available';
          }
        } else if (status === 'In Progress') {
          vehicleDoc.status = 'Maintenance';
        }
        await vehicleDoc.save();
      }
    }

    res.json({
      success: true,
      record: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin)
const deleteMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Maintenance entry deleted.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upcoming maintenance list (< 14 days or overdue)
// @route   GET /api/maintenance/upcoming/alerts
// @access  Private
const getUpcomingServices = async (req, res, next) => {
  try {
    const fourteenDaysAhead = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const vehiclesDue = await Vehicle.find({
      nextServiceDate: { $lte: fourteenDaysAhead },
    })
      .select('registrationNumber brand model nextServiceDate lastServiceDate currentMileage status')
      .sort('nextServiceDate');

    res.json({
      success: true,
      count: vehiclesDue.length,
      upcoming: vehiclesDue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getUpcomingServices,
};

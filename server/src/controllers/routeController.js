const RoutePlan = require('../models/RoutePlan');

// @desc    Get all routes with search & filter
// @route   GET /api/routes
// @access  Private
const getRoutes = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { routeCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { originCity: { $regex: search, $options: 'i' } },
        { destinationCity: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.currentStatus = status;
    }

    const routes = await RoutePlan.find(query)
      .populate('assignedVehicle', 'registrationNumber brand model vehicleType status')
      .populate('assignedDriver', 'name phone status')
      .sort('-createdAt');

    res.json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Private
const getRouteById = async (req, res, next) => {
  try {
    const route = await RoutePlan.findById(req.params.id)
      .populate('assignedVehicle', 'registrationNumber brand model vehicleType status capacity')
      .populate('assignedDriver', 'name phone email licenseNumber status');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route plan not found.',
      });
    }

    res.json({
      success: true,
      route,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Admin, Fleet Manager)
const createRoute = async (req, res, next) => {
  try {
    const {
      routeCode,
      title,
      originCity,
      destinationCity,
      distanceKm,
      estimatedDurationHours,
      assignedVehicle,
      assignedDriver,
      currentStatus,
      waypoints,
      tollExpensesEstimated,
    } = req.body;

    const existing = await RoutePlan.findOne({ routeCode: routeCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Route code already exists.',
      });
    }

    const route = await RoutePlan.create({
      routeCode,
      title,
      originCity,
      destinationCity,
      distanceKm,
      estimatedDurationHours,
      assignedVehicle: assignedVehicle || null,
      assignedDriver: assignedDriver || null,
      currentStatus: currentStatus || 'Scheduled',
      waypoints: waypoints || [],
      tollExpensesEstimated: tollExpensesEstimated || 0,
    });

    res.status(201).json({
      success: true,
      route,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private (Admin, Fleet Manager)
const updateRoute = async (req, res, next) => {
  try {
    const route = await RoutePlan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('assignedVehicle', 'registrationNumber brand model')
      .populate('assignedDriver', 'name phone');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    res.json({
      success: true,
      route,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private (Admin)
const deleteRoute = async (req, res, next) => {
  try {
    const route = await RoutePlan.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found.',
      });
    }

    await route.deleteOne();

    res.json({
      success: true,
      message: `Route plan ${route.routeCode} deleted.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};

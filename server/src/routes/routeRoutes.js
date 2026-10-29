const express = require('express');
const router = express.Router();
const {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRoutes)
  .post(authorize('admin', 'fleet_manager'), createRoute);

router.route('/:id')
  .get(getRouteById)
  .put(authorize('admin', 'fleet_manager'), updateRoute)
  .delete(authorize('admin'), deleteRoute);

module.exports = router;

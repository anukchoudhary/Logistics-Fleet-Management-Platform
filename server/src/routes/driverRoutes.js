const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDrivers)
  .post(authorize('admin', 'fleet_manager'), createDriver);

router.route('/:id')
  .get(getDriverById)
  .put(authorize('admin', 'fleet_manager'), updateDriver)
  .delete(authorize('admin'), deleteDriver);

router.patch('/:id/assign-vehicle', authorize('admin', 'fleet_manager'), assignVehicle);

module.exports = router;

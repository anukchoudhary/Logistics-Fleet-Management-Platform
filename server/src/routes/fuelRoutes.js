const express = require('express');
const router = express.Router();
const {
  getFuelRecords,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
  getFuelAnalytics,
} = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getFuelAnalytics);

router.route('/')
  .get(getFuelRecords)
  .post(authorize('admin', 'fleet_manager'), createFuelRecord);

router.route('/:id')
  .put(authorize('admin', 'fleet_manager'), updateFuelRecord)
  .delete(authorize('admin'), deleteFuelRecord);

module.exports = router;

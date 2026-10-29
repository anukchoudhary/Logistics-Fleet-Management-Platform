const express = require('express');
const router = express.Router();
const {
  getMaintenanceRecords,
  getMaintenanceById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getUpcomingServices,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/upcoming/alerts', getUpcomingServices);

router.route('/')
  .get(getMaintenanceRecords)
  .post(authorize('admin', 'fleet_manager'), createMaintenanceRecord);

router.route('/:id')
  .get(getMaintenanceById)
  .put(authorize('admin', 'fleet_manager'), updateMaintenanceRecord)
  .delete(authorize('admin'), deleteMaintenanceRecord);

module.exports = router;

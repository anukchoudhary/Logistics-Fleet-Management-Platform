const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats/summary', getVehicleStats);
router.route('/')
  .get(getVehicles)
  .post(authorize('admin', 'fleet_manager'), createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(authorize('admin', 'fleet_manager'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

module.exports = router;

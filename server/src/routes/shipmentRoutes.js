const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getShipments)
  .post(authorize('admin', 'fleet_manager'), createShipment);

router.route('/:id')
  .get(getShipmentById)
  .put(authorize('admin', 'fleet_manager'), updateShipment)
  .delete(authorize('admin'), deleteShipment);

router.patch('/:id/status', updateShipmentStatus);

module.exports = router;

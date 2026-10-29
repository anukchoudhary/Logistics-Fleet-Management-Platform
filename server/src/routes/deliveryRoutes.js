const express = require('express');
const router = express.Router();
const {
  getAssignedDeliveries,
  updateDeliveryStatus,
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAssignedDeliveries);
router.patch('/:id/update-status', updateDeliveryStatus);

module.exports = router;

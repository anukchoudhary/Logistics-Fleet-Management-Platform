const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getReportData,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/export', getReportData);

module.exports = router;

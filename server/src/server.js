const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { syncFleetAlerts } = require('./utils/notificationHelper');
const { seedDatabase } = require('./seed/seedData');
const User = require('./models/User');

dotenv.config();

const app = express();

// Initialize Database connection
connectDB().then(async () => {
  // If the database has no users, automatically run initial seed so the platform works out-of-the-box
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No existing users found. Auto-populating realistic logistics seed data...');
      await seedDatabase();
      console.log('[Bootstrap] Initial database bootstrap complete.');
    } else {
      // Sync alert notifications on startup
      syncFleetAlerts();
    }
  } catch (seedErr) {
    console.warn('[Bootstrap] Auto-seed check notice:', seedErr.message);
  }
});

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== 'production' ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production deployment cross-origin
    },
    credentials: true,
  })
);

app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Logistics and Fleet Management API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/fuel', require('./routes/fuelRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Periodic fleet alerts check every 30 minutes
setInterval(() => {
  syncFleetAlerts();
}, 30 * 60 * 1000);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Comprehensive Logistics & Fleet Platform API running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

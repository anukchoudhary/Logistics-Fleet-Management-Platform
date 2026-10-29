const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String },
  order: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
});

const routePlanSchema = new mongoose.Schema(
  {
    routeCode: {
      type: String,
      required: [true, 'Route Code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Route title is required'],
      trim: true,
    },
    originCity: {
      type: String,
      required: [true, 'Origin city is required'],
      trim: true,
    },
    destinationCity: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: [true, 'Distance in km is required'],
      min: [1, 'Distance must be at least 1 km'],
    },
    estimatedDurationHours: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [0.5, 'Duration must be at least 0.5 hours'],
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    currentStatus: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Delayed', 'Cancelled'],
      default: 'Scheduled',
    },
    waypoints: [waypointSchema],
    tollExpensesEstimated: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutePlan', routePlanSchema);

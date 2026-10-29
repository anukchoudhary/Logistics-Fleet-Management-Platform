const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'Scheduled Service',
        'Engine Overhaul',
        'Brake Replacement',
        'Tire Replacement',
        'Oil & Filter Change',
        'Electrical Repair',
        'Suspension Work',
        'Emergency Breakdown',
      ],
      default: 'Scheduled Service',
    },
    serviceDate: {
      type: Date,
      required: [true, 'Service date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    workshop: {
      type: String,
      required: [true, 'Workshop name is required'],
      trim: true,
    },
    nextServiceDate: {
      type: Date,
      required: [true, 'Next service date is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    odometerAtService: {
      type: Number,
      min: [0, 'Odometer reading cannot be negative'],
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);

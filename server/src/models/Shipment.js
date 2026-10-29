const mongoose = require('mongoose');

const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
});

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: [true, 'Shipment ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },
    packageDescription: {
      type: String,
      required: [true, 'Package description is required'],
      trim: true,
    },
    packageWeight: {
      type: Number, // in kg
      required: [true, 'Package weight is required'],
      min: [0.1, 'Weight must be greater than 0'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    priority: {
      type: String,
      enum: ['Low', 'Standard', 'High', 'Urgent'],
      default: 'Standard',
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Assigned',
        'Picked Up',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
    },
    timeline: [statusTimelineSchema],
    deliveryNotes: {
      type: String,
      trim: true,
    },
    recipientSignedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);

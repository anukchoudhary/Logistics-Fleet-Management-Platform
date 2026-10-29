const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, 'Vehicle ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Heavy Commercial (HCV)', 'Medium Commercial (MCV)', 'Light Commercial (LCV)', 'Cargo Trailer', 'Refrigerated Carrier'],
      default: 'Medium Commercial (MCV)',
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    manufacturingYear: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1990, 'Year must be 1990 or newer'],
      max: [new Date().getFullYear() + 1, 'Invalid manufacturing year'],
    },
    capacity: {
      type: Number, // in kg
      required: [true, 'Capacity in kg is required'],
      min: [100, 'Capacity must be at least 100 kg'],
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'CNG', 'Electric', 'Petrol'],
      default: 'Diesel',
    },
    currentMileage: {
      type: Number, // in km
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'In Transit', 'Maintenance', 'Inactive'],
      default: 'Available',
    },
    insuranceExpiry: {
      type: Date,
      required: [true, 'Insurance expiry date is required'],
    },
    pucExpiry: {
      type: Date,
      required: [true, 'PUC expiry date is required'],
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDate: {
      type: Date,
      required: [true, 'Next service date is required'],
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);

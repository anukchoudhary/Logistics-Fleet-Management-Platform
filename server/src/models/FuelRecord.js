const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Fuel fill date is required'],
      default: Date.now,
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'CNG', 'Electric', 'Petrol'],
      default: 'Diesel',
    },
    litres: {
      type: Number,
      required: [true, 'Litres / quantity is required'],
      min: [0.1, 'Litres must be greater than 0'],
    },
    pricePerLitre: {
      type: Number,
      required: [true, 'Price per litre is required'],
      min: [1, 'Price per litre must be greater than 0'],
    },
    totalCost: {
      type: Number,
      required: true,
    },
    odometerReading: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    fuelStation: {
      type: String,
      required: [true, 'Fuel station name/location is required'],
      trim: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto compute total cost before save
fuelRecordSchema.pre('validate', function (next) {
  if (this.litres && this.pricePerLitre) {
    this.totalCost = Math.round(this.litres * this.pricePerLitre * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);

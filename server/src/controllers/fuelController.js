const FuelRecord = require('../models/FuelRecord');
const Vehicle = require('../models/Vehicle');

// @desc    Get all fuel records with pagination and search
// @route   GET /api/fuel
// @access  Private
const getFuelRecords = async (req, res, next) => {
  try {
    const {
      vehicleId,
      fuelType,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await FuelRecord.countDocuments(query);

    const fuelRecords = await FuelRecord.find(query)
      .populate('vehicle', 'registrationNumber brand model vehicleType')
      .populate('driver', 'name phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: fuelRecords.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      fuelRecords,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new fuel record
// @route   POST /api/fuel
// @access  Private (Admin, Fleet Manager)
const createFuelRecord = async (req, res, next) => {
  try {
    const {
      vehicle,
      driver,
      date,
      fuelType,
      litres,
      pricePerLitre,
      odometerReading,
      fuelStation,
      receiptNumber,
    } = req.body;

    const calculatedTotal = Math.round(Number(litres) * Number(pricePerLitre) * 100) / 100;

    const record = await FuelRecord.create({
      vehicle,
      driver: driver || null,
      date: date || new Date(),
      fuelType: fuelType || 'Diesel',
      litres: Number(litres),
      pricePerLitre: Number(pricePerLitre),
      totalCost: calculatedTotal,
      odometerReading: Number(odometerReading),
      fuelStation,
      receiptNumber,
    });

    // Update vehicle's mileage if this reading is higher
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (vehicleDoc && Number(odometerReading) > vehicleDoc.currentMileage) {
      vehicleDoc.currentMileage = Number(odometerReading);
      await vehicleDoc.save();
    }

    const populated = await FuelRecord.findById(record._id)
      .populate('vehicle', 'registrationNumber brand model')
      .populate('driver', 'name');

    res.status(201).json({
      success: true,
      fuelRecord: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update fuel record
// @route   PUT /api/fuel/:id
// @access  Private (Admin, Fleet Manager)
const updateFuelRecord = async (req, res, next) => {
  try {
    const { litres, pricePerLitre, ...rest } = req.body;
    const updateData = { ...rest };

    if (litres !== undefined) updateData.litres = Number(litres);
    if (pricePerLitre !== undefined) updateData.pricePerLitre = Number(pricePerLitre);

    if (updateData.litres !== undefined && updateData.pricePerLitre !== undefined) {
      updateData.totalCost =
        Math.round(updateData.litres * updateData.pricePerLitre * 100) / 100;
    }

    const updated = await FuelRecord.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('vehicle', 'registrationNumber brand model')
      .populate('driver', 'name');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Fuel record not found.',
      });
    }

    res.json({
      success: true,
      fuelRecord: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete fuel record
// @route   DELETE /api/fuel/:id
// @access  Private (Admin)
const deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Fuel record not found.',
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Fuel record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get fuel analytics (totals, monthly trend, vehicle breakdown)
// @route   GET /api/fuel/analytics
// @access  Private
const getFuelAnalytics = async (req, res, next) => {
  try {
    const allRecords = await FuelRecord.find().populate(
      'vehicle',
      'registrationNumber brand model'
    );

    const totalExpense = allRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const totalLitres = allRecords.reduce((sum, r) => sum + (r.litres || 0), 0);
    const averagePricePerLitre =
      totalLitres > 0 ? Math.round((totalExpense / totalLitres) * 100) / 100 : 0;

    // Monthly breakdown
    const monthlyMap = {};
    // Vehicle-wise breakdown
    const vehicleMap = {};

    allRecords.forEach((r) => {
      const monthKey = new Date(r.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, totalCost: 0, litres: 0 };
      }
      monthlyMap[monthKey].totalCost += r.totalCost || 0;
      monthlyMap[monthKey].litres += r.litres || 0;

      const vPlate = r.vehicle?.registrationNumber || 'Unknown';
      if (!vehicleMap[vPlate]) {
        vehicleMap[vPlate] = {
          registrationNumber: vPlate,
          brand: r.vehicle?.brand || '',
          model: r.vehicle?.model || '',
          totalCost: 0,
          litres: 0,
          entries: 0,
        };
      }
      vehicleMap[vPlate].totalCost += r.totalCost || 0;
      vehicleMap[vPlate].litres += r.litres || 0;
      vehicleMap[vPlate].entries += 1;
    });

    const monthlyExpense = Object.values(monthlyMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    const vehicleWiseUsage = Object.values(vehicleMap).sort(
      (a, b) => b.totalCost - a.totalCost
    );

    res.json({
      success: true,
      totalExpense: Math.round(totalExpense),
      totalLitres: Math.round(totalLitres),
      averagePricePerLitre,
      monthlyExpense,
      vehicleWiseUsage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFuelRecords,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
  getFuelAnalytics,
};

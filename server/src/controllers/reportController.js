const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Shipment = require('../models/Shipment');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');

// @desc    Get complete real-time dashboard analytics & metrics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Core KPIs
    const [
      totalVehicles,
      availableVehicles,
      inTransitVehicles,
      maintenanceVehicles,
      totalDrivers,
      availableDrivers,
      onTripDrivers,
      activeShipments,
      deliveredShipments,
      pendingShipments,
      maintenanceDueCount,
      allFuelRecords,
      allMaintenanceRecords,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'Available' }),
      Vehicle.countDocuments({ status: 'In Transit' }),
      Vehicle.countDocuments({ status: 'Maintenance' }),
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'Available' }),
      Driver.countDocuments({ status: 'On Trip' }),
      Shipment.countDocuments({
        status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
      }),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Pending' }),
      Vehicle.countDocuments({ nextServiceDate: { $lte: sevenDaysAhead } }),
      FuelRecord.find().select('totalCost litres date'),
      Maintenance.find().select('cost serviceDate status serviceType'),
    ]);

    const totalFuelExpenses = allFuelRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const totalMaintenanceExpenses = allMaintenanceRecords.reduce(
      (sum, r) => sum + (r.cost || 0),
      0
    );

    // 2. Monthly Deliveries & Trend (Past 6 months)
    const allShipments = await Shipment.find().select('createdDate actualDeliveryDate status');
    const monthlyShipmentsMap = {};
    const monthsOrder = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short' });
      monthlyShipmentsMap[key] = { month: label, delivered: 0, created: 0, pending: 0 };
      monthsOrder.push(key);
    }

    allShipments.forEach((s) => {
      const cKey = new Date(s.createdDate).toISOString().slice(0, 7);
      if (monthlyShipmentsMap[cKey]) {
        monthlyShipmentsMap[cKey].created += 1;
        if (s.status === 'Pending') monthlyShipmentsMap[cKey].pending += 1;
      }
      if (s.actualDeliveryDate) {
        const dKey = new Date(s.actualDeliveryDate).toISOString().slice(0, 7);
        if (monthlyShipmentsMap[dKey]) {
          monthlyShipmentsMap[dKey].delivered += 1;
        }
      }
    });

    const monthlyDeliveries = monthsOrder.map((key) => monthlyShipmentsMap[key]);

    // 3. Vehicle Utilization breakdown
    const vehicleUtilization = [
      { name: 'Available', value: availableVehicles, color: '#16a34a' },
      { name: 'In Transit', value: inTransitVehicles, color: '#2563eb' },
      { name: 'Maintenance', value: maintenanceVehicles, color: '#ea580c' },
      {
        name: 'Inactive',
        value: Math.max(
          0,
          totalVehicles - (availableVehicles + inTransitVehicles + maintenanceVehicles)
        ),
        color: '#64748b',
      },
    ];

    // 4. Shipment Status distribution
    const statusCounts = await Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const shipmentStatusDistribution = statusCounts.map((s) => ({
      status: s._id,
      count: s.count,
    }));

    // 5. Monthly Expenses Trend (Fuel vs Maintenance)
    const expenseMonthsMap = {};
    monthsOrder.forEach((key) => {
      const date = new Date(key + '-01');
      expenseMonthsMap[key] = {
        month: date.toLocaleString('default', { month: 'short' }),
        fuel: 0,
        maintenance: 0,
      };
    });

    allFuelRecords.forEach((f) => {
      const fKey = new Date(f.date).toISOString().slice(0, 7);
      if (expenseMonthsMap[fKey]) {
        expenseMonthsMap[fKey].fuel += Math.round(f.totalCost || 0);
      }
    });

    allMaintenanceRecords.forEach((m) => {
      const mKey = new Date(m.serviceDate).toISOString().slice(0, 7);
      if (expenseMonthsMap[mKey]) {
        expenseMonthsMap[mKey].maintenance += Math.round(m.cost || 0);
      }
    });

    const monthlyExpensesTrend = monthsOrder.map((key) => expenseMonthsMap[key]);

    // 6. Recent critical shipments for dashboard quick view
    const recentShipments = await Shipment.find()
      .populate('vehicle', 'registrationNumber')
      .populate('driver', 'name')
      .sort('-createdDate')
      .limit(6);

    res.json({
      success: true,
      kpis: {
        totalVehicles,
        availableVehicles,
        inTransitVehicles,
        maintenanceVehicles,
        totalDrivers,
        availableDrivers,
        onTripDrivers,
        activeShipments,
        deliveredShipments,
        pendingShipments,
        maintenanceDueCount,
        totalFuelExpenses: Math.round(totalFuelExpenses),
        totalMaintenanceExpenses: Math.round(totalMaintenanceExpenses),
      },
      charts: {
        monthlyDeliveries,
        vehicleUtilization,
        shipmentStatusDistribution,
        monthlyExpensesTrend,
      },
      recentShipments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate tabular reports with date filtering
// @route   GET /api/reports/export
// @access  Private
const getReportData = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    let reportRows = [];
    let title = 'Logistics Report';

    switch (reportType) {
      case 'fuel': {
        title = 'Fuel Expense Report';
        const q = dateFilter.$gte || dateFilter.$lte ? { date: dateFilter } : {};
        const records = await FuelRecord.find(q)
          .populate('vehicle', 'registrationNumber brand model')
          .populate('driver', 'name')
          .sort('-date');

        reportRows = records.map((r) => ({
          Date: new Date(r.date).toISOString().slice(0, 10),
          Vehicle: r.vehicle?.registrationNumber || 'N/A',
          Brand_Model: `${r.vehicle?.brand || ''} ${r.vehicle?.model || ''}`.trim(),
          Driver: r.driver?.name || 'N/A',
          Fuel_Type: r.fuelType,
          Litres: r.litres,
          Price_Per_Litre: r.pricePerLitre,
          Total_Cost_INR: r.totalCost,
          Odometer_KM: r.odometerReading,
          Station: r.fuelStation,
        }));
        break;
      }

      case 'maintenance': {
        title = 'Maintenance Expense Report';
        const q =
          dateFilter.$gte || dateFilter.$lte ? { serviceDate: dateFilter } : {};
        const records = await Maintenance.find(q)
          .populate('vehicle', 'registrationNumber brand model')
          .sort('-serviceDate');

        reportRows = records.map((m) => ({
          Service_Date: new Date(m.serviceDate).toISOString().slice(0, 10),
          Vehicle: m.vehicle?.registrationNumber || 'N/A',
          Service_Type: m.serviceType,
          Workshop: m.workshop,
          Cost_INR: m.cost,
          Status: m.status,
          Next_Service_Due: new Date(m.nextServiceDate).toISOString().slice(0, 10),
          Description: m.description,
        }));
        break;
      }

      case 'deliveries': {
        title = 'Delivery Performance Report';
        const q =
          dateFilter.$gte || dateFilter.$lte ? { createdDate: dateFilter } : {};
        const records = await Shipment.find(q)
          .populate('vehicle', 'registrationNumber')
          .populate('driver', 'name')
          .sort('-createdDate');

        reportRows = records.map((s) => ({
          Shipment_ID: s.shipmentId,
          Customer: s.customerName,
          Phone: s.customerPhone,
          Status: s.status,
          Priority: s.priority,
          Assigned_Vehicle: s.vehicle?.registrationNumber || 'Unassigned',
          Assigned_Driver: s.driver?.name || 'Unassigned',
          Weight_KG: s.packageWeight,
          Created_Date: new Date(s.createdDate).toISOString().slice(0, 10),
          Target_Date: new Date(s.expectedDeliveryDate).toISOString().slice(0, 10),
          Actual_Delivery_Date: s.actualDeliveryDate
            ? new Date(s.actualDeliveryDate).toISOString().slice(0, 10)
            : 'Pending',
        }));
        break;
      }

      case 'drivers': {
        title = 'Driver Performance Report';
        const drivers = await Driver.find()
          .populate('assignedVehicle', 'registrationNumber')
          .sort('name');

        const driverStats = await Promise.all(
          drivers.map(async (d) => {
            const completed = await Shipment.countDocuments({
              driver: d._id,
              status: 'Delivered',
            });
            const active = await Shipment.countDocuments({
              driver: d._id,
              status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
            });
            return {
              Driver_ID: d.driverId,
              Name: d.name,
              Phone: d.phone,
              License: d.licenseNumber,
              License_Expiry: new Date(d.licenseExpiry).toISOString().slice(0, 10),
              Experience_Years: d.experience,
              Assigned_Vehicle: d.assignedVehicle?.registrationNumber || 'None',
              Status: d.status,
              Completed_Deliveries: completed,
              Active_Deliveries: active,
            };
          })
        );
        reportRows = driverStats;
        break;
      }

      case 'fleet':
      default: {
        title = 'Fleet Utilization & Compliance Report';
        const vehicles = await Vehicle.find()
          .populate('assignedDriver', 'name')
          .sort('registrationNumber');

        reportRows = vehicles.map((v) => ({
          Vehicle_ID: v.vehicleId,
          Registration: v.registrationNumber,
          Brand: v.brand,
          Model: v.model,
          Type: v.vehicleType,
          Status: v.status,
          Capacity_KG: v.capacity,
          Fuel_Type: v.fuelType,
          Odometer_KM: v.currentMileage,
          Assigned_Driver: v.assignedDriver?.name || 'Unassigned',
          Insurance_Expiry: new Date(v.insuranceExpiry).toISOString().slice(0, 10),
          PUC_Expiry: new Date(v.pucExpiry).toISOString().slice(0, 10),
          Next_Service_Date: new Date(v.nextServiceDate).toISOString().slice(0, 10),
        }));
        break;
      }
    }

    res.json({
      success: true,
      title,
      reportType,
      count: reportRows.length,
      data: reportRows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardAnalytics,
  getReportData,
};

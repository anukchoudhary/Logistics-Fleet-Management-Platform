const Notification = require('../models/Notification');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

const createNotification = async ({
  title,
  message,
  type = 'info',
  category = 'system',
  relatedId = null,
  entityModel = null,
}) => {
  try {
    return await Notification.create({
      title,
      message,
      type,
      category,
      relatedId,
      entityModel,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

const syncFleetAlerts = async () => {
  try {
    const now = new Date();
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const fifteenDaysAhead = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Check Vehicle Insurance Expiry
    const vehiclesWithExpiringInsurance = await Vehicle.find({
      insuranceExpiry: { $lte: thirtyDaysAhead, $gte: now },
    });

    for (const v of vehiclesWithExpiringInsurance) {
      const existing = await Notification.findOne({
        category: 'insurance',
        relatedId: v._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });
      if (!existing) {
        const daysLeft = Math.ceil((v.insuranceExpiry - now) / (1000 * 60 * 60 * 24));
        await createNotification({
          title: `Insurance Renewal Notice: ${v.registrationNumber}`,
          message: `Commercial insurance for ${v.brand} ${v.model} (${v.registrationNumber}) expires in ${daysLeft} day(s).`,
          type: daysLeft <= 7 ? 'critical' : 'warning',
          category: 'insurance',
          relatedId: v._id.toString(),
          entityModel: 'Vehicle',
        });
      }
    }

    // 2. Check Vehicle PUC Expiry
    const vehiclesWithExpiringPuc = await Vehicle.find({
      pucExpiry: { $lte: fifteenDaysAhead, $gte: now },
    });

    for (const v of vehiclesWithExpiringPuc) {
      const existing = await Notification.findOne({
        category: 'puc',
        relatedId: v._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      });
      if (!existing) {
        const daysLeft = Math.ceil((v.pucExpiry - now) / (1000 * 60 * 60 * 24));
        await createNotification({
          title: `PUC Certificate Due: ${v.registrationNumber}`,
          message: `Pollution Under Control (PUC) certificate for ${v.registrationNumber} expires in ${daysLeft} day(s).`,
          type: 'warning',
          category: 'puc',
          relatedId: v._id.toString(),
          entityModel: 'Vehicle',
        });
      }
    }

    // 3. Check Driver License Expiry
    const driversWithExpiringLicense = await Driver.find({
      licenseExpiry: { $lte: thirtyDaysAhead, $gte: now },
    });

    for (const d of driversWithExpiringLicense) {
      const existing = await Notification.findOne({
        category: 'license',
        relatedId: d._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });
      if (!existing) {
        const daysLeft = Math.ceil((d.licenseExpiry - now) / (1000 * 60 * 60 * 24));
        await createNotification({
          title: `Commercial Driver License Expiring: ${d.name}`,
          message: `Heavy vehicle driving license for ${d.name} (${d.licenseNumber}) expires in ${daysLeft} day(s).`,
          type: daysLeft <= 10 ? 'critical' : 'warning',
          category: 'license',
          relatedId: d._id.toString(),
          entityModel: 'Driver',
        });
      }
    }

    // 4. Check Vehicle Maintenance Due
    const vehiclesWithMaintenanceDue = await Vehicle.find({
      nextServiceDate: { $lte: sevenDaysAhead },
    });

    for (const v of vehiclesWithMaintenanceDue) {
      const existing = await Notification.findOne({
        category: 'maintenance',
        relatedId: v._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      });
      if (!existing) {
        const isOverdue = v.nextServiceDate < now;
        await createNotification({
          title: isOverdue
            ? `Service Overdue: ${v.registrationNumber}`
            : `Routine Maintenance Due: ${v.registrationNumber}`,
          message: isOverdue
            ? `Scheduled periodic service for ${v.registrationNumber} is overdue!`
            : `Periodic service inspection for ${v.registrationNumber} is scheduled within 7 days.`,
          type: isOverdue ? 'critical' : 'warning',
          category: 'maintenance',
          relatedId: v._id.toString(),
          entityModel: 'Vehicle',
        });
      }
    }
  } catch (err) {
    console.error('Error during fleet alerts synchronization:', err.message);
  }
};

module.exports = { createNotification, syncFleetAlerts };

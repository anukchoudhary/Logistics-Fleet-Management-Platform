const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');

dotenv.config();

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Shipment = require('../models/Shipment');
const Maintenance = require('../models/Maintenance');
const FuelRecord = require('../models/FuelRecord');
const RoutePlan = require('../models/RoutePlan');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Purging existing database collections...');

  await Promise.all([
    User.deleteMany(),
    Vehicle.deleteMany(),
    Driver.deleteMany(),
    Shipment.deleteMany(),
    Maintenance.deleteMany(),
    FuelRecord.deleteMany(),
    RoutePlan.deleteMany(),
    Notification.deleteMany(),
  ]);

  console.log('[Seed] Inserting Drivers...');
  const driversData = [
      {
        driverId: 'DRV-101',
        name: 'Rajesh Kumar',
        phone: '+91 98112 43210',
        email: 'rajesh.driver@logistics.hcl.internal',
        licenseNumber: 'DL-0420180029102',
        licenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        experience: 8,
        status: 'Available',
        joiningDate: new Date('2021-03-15'),
        emergencyContact: '+91 98112 43299 (Spouse)',
      },
      {
        driverId: 'DRV-102',
        name: 'Vikram Singh Shekhawat',
        phone: '+91 94140 88219',
        email: 'vikram.singh@logistics.hcl.internal',
        licenseNumber: 'RJ-1420160081240',
        licenseExpiry: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // Expiring in 25 days -> triggers alert!
        experience: 11,
        status: 'On Trip',
        joiningDate: new Date('2019-07-10'),
        emergencyContact: '+91 94140 88200 (Brother)',
      },
      {
        driverId: 'DRV-103',
        name: 'Suresh Patel',
        phone: '+91 98250 19342',
        email: 'suresh.patel@logistics.hcl.internal',
        licenseNumber: 'GJ-0120190045192',
        licenseExpiry: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
        experience: 6,
        status: 'Available',
        joiningDate: new Date('2022-01-20'),
        emergencyContact: '+91 98250 19300',
      },
      {
        driverId: 'DRV-104',
        name: 'Gurpreet Singh',
        phone: '+91 98722 55431',
        email: 'gurpreet.singh@logistics.hcl.internal',
        licenseNumber: 'PB-1020150039128',
        licenseExpiry: new Date(Date.now() + 410 * 24 * 60 * 60 * 1000),
        experience: 14,
        status: 'On Trip',
        joiningDate: new Date('2018-05-12'),
        emergencyContact: '+91 98722 55400',
      },
      {
        driverId: 'DRV-105',
        name: 'Amit Sharma',
        phone: '+91 97110 32187',
        email: 'amit.sharma@logistics.hcl.internal',
        licenseNumber: 'HR-2620200091244',
        licenseExpiry: new Date(Date.now() + 540 * 24 * 60 * 60 * 1000),
        experience: 5,
        status: 'Available',
        joiningDate: new Date('2023-04-01'),
        emergencyContact: '+91 97110 32100',
      },
      {
        driverId: 'DRV-106',
        name: 'Ramesh Yadav',
        phone: '+91 94500 12876',
        email: 'ramesh.yadav@logistics.hcl.internal',
        licenseNumber: 'UP-3220170067341',
        licenseExpiry: new Date(Date.now() + 290 * 24 * 60 * 60 * 1000),
        experience: 9,
        status: 'Available',
        joiningDate: new Date('2020-09-15'),
        emergencyContact: '+91 94500 12800',
      },
      {
        driverId: 'DRV-107',
        name: 'Manoj Verma',
        phone: '+91 99201 84729',
        email: 'manoj.verma@logistics.hcl.internal',
        licenseNumber: 'MH-1220190056123',
        licenseExpiry: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000),
        experience: 7,
        status: 'On Trip',
        joiningDate: new Date('2022-08-11'),
        emergencyContact: '+91 99201 84700',
      },
      {
        driverId: 'DRV-108',
        name: 'Sandeep Chauhan',
        phone: '+91 98160 44321',
        email: 'sandeep.chauhan@logistics.hcl.internal',
        licenseNumber: 'DL-0120210014920',
        licenseExpiry: new Date(Date.now() + 600 * 24 * 60 * 60 * 1000),
        experience: 4,
        status: 'On Leave',
        joiningDate: new Date('2023-11-01'),
        emergencyContact: '+91 98160 44300',
      },
    ];

    const insertedDrivers = await Driver.insertMany(driversData);

    console.log('[Seed] Inserting Seed Users with hashed passwords...');
    const usersData = [
      {
        name: 'Arunav Sengupta (Admin)',
        email: 'admin@logistics.hcl.internal',
        password: 'Admin@2026',
        role: 'admin',
        phone: '+91 98100 00001',
      },
      {
        name: 'Pooja Deshmukh (Fleet Manager)',
        email: 'manager@logistics.hcl.internal',
        password: 'Manager@2026',
        role: 'fleet_manager',
        phone: '+91 98100 00002',
      },
      {
        name: 'Rajesh Kumar (Driver)',
        email: 'rajesh.driver@logistics.hcl.internal',
        password: 'Driver@2026',
        role: 'driver',
        phone: '+91 98112 43210',
        driverProfile: insertedDrivers[0]._id,
      },
    ];

    for (const u of usersData) {
      await User.create(u);
    }

    console.log('[Seed] Inserting 11 Vehicles with real specifications...');
    const vehiclesData = [
      {
        vehicleId: 'VEH-101',
        registrationNumber: 'DL 01 AB 4921',
        vehicleType: 'Heavy Commercial (HCV)',
        brand: 'Tata Motors',
        model: 'Signa 4825.TK',
        manufacturingYear: 2022,
        capacity: 28000,
        fuelType: 'Diesel',
        currentMileage: 74210,
        status: 'In Transit',
        insuranceExpiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-08-10'),
        nextServiceDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        assignedDriver: insertedDrivers[1]._id, // Vikram Singh
      },
      {
        vehicleId: 'VEH-102',
        registrationNumber: 'HR 26 DR 5821',
        vehicleType: 'Medium Commercial (MCV)',
        brand: 'Ashok Leyland',
        model: 'Ecomet 1215 HE',
        manufacturingYear: 2021,
        capacity: 11500,
        fuelType: 'Diesel',
        currentMileage: 89400,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Expiring in 20 days -> triggers alert!
        pucExpiry: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Expiring in 10 days -> triggers alert!
        lastServiceDate: new Date('2026-07-01'),
        nextServiceDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Maintenance due in 4 days!
        assignedDriver: insertedDrivers[0]._id, // Rajesh Kumar
      },
      {
        vehicleId: 'VEH-103',
        registrationNumber: 'RJ 14 GC 1940',
        vehicleType: 'Medium Commercial (MCV)',
        brand: 'Eicher Motors',
        model: 'Pro 3019',
        manufacturingYear: 2023,
        capacity: 14000,
        fuelType: 'Diesel',
        currentMileage: 41200,
        status: 'In Transit',
        insuranceExpiry: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-09-05'),
        nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        assignedDriver: insertedDrivers[3]._id, // Gurpreet Singh
      },
      {
        vehicleId: 'VEH-104',
        registrationNumber: 'MH 12 RN 8302',
        vehicleType: 'Heavy Commercial (HCV)',
        brand: 'BharatBenz',
        model: '2823R Heavy Truck',
        manufacturingYear: 2022,
        capacity: 25000,
        fuelType: 'Diesel',
        currentMileage: 112500,
        status: 'In Transit',
        insuranceExpiry: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-08-15'),
        nextServiceDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        assignedDriver: insertedDrivers[6]._id, // Manoj Verma
      },
      {
        vehicleId: 'VEH-105',
        registrationNumber: 'GJ 01 TX 9942',
        vehicleType: 'Light Commercial (LCV)',
        brand: 'Tata Motors',
        model: 'Ultra T.7',
        manufacturingYear: 2023,
        capacity: 4500,
        fuelType: 'CNG',
        currentMileage: 32150,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 290 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-09-12'),
        nextServiceDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        assignedDriver: insertedDrivers[2]._id, // Suresh Patel
      },
      {
        vehicleId: 'VEH-106',
        registrationNumber: 'UP 32 BN 4410',
        vehicleType: 'Light Commercial (LCV)',
        brand: 'Mahindra',
        model: 'Bolero Maxi Truck Plus',
        manufacturingYear: 2020,
        capacity: 1700,
        fuelType: 'Diesel',
        currentMileage: 95400,
        status: 'Maintenance',
        insuranceExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-06-20'),
        nextServiceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue by 2 days!
        assignedDriver: insertedDrivers[5]._id, // Ramesh Yadav
      },
      {
        vehicleId: 'VEH-107',
        registrationNumber: 'DL 03 CD 7190',
        vehicleType: 'Refrigerated Carrier',
        brand: 'Tata Motors',
        model: 'Signa 2823.K Reefer',
        manufacturingYear: 2022,
        capacity: 16000,
        fuelType: 'Diesel',
        currentMileage: 64800,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-08-25'),
        nextServiceDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
        assignedDriver: insertedDrivers[4]._id, // Amit Sharma
      },
      {
        vehicleId: 'VEH-108',
        registrationNumber: 'MH 14 CP 3319',
        vehicleType: 'Medium Commercial (MCV)',
        brand: 'Eicher Motors',
        model: 'Pro 2049 Cargo',
        manufacturingYear: 2021,
        capacity: 5000,
        fuelType: 'CNG',
        currentMileage: 58900,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 190 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-07-15'),
        nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedDriver: null,
      },
      {
        vehicleId: 'VEH-109',
        registrationNumber: 'HR 55 AT 1024',
        vehicleType: 'Cargo Trailer',
        brand: 'Ashok Leyland',
        model: '4220 10x2 Haulage',
        manufacturingYear: 2023,
        capacity: 32000,
        fuelType: 'Diesel',
        currentMileage: 38200,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 340 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-09-01'),
        nextServiceDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        assignedDriver: null,
      },
      {
        vehicleId: 'VEH-110',
        registrationNumber: 'RJ 02 KL 6512',
        vehicleType: 'Light Commercial (LCV)',
        brand: 'Tata Motors',
        model: 'Ace Gold Diesel+',
        manufacturingYear: 2022,
        capacity: 1200,
        fuelType: 'Diesel',
        currentMileage: 46100,
        status: 'Available',
        insuranceExpiry: new Date(Date.now() + 175 * 24 * 60 * 60 * 1000),
        pucExpiry: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        lastServiceDate: new Date('2026-08-01'),
        nextServiceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        assignedDriver: null,
      },
      {
        vehicleId: 'VEH-111',
        registrationNumber: 'DL 08 EF 2289',
        vehicleType: 'Heavy Commercial (HCV)',
        brand: 'BharatBenz',
        model: '3528C Heavy Haul',
        manufacturingYear: 2020,
        capacity: 30000,
        fuelType: 'Diesel',
        currentMileage: 141200,
        status: 'Inactive',
        insuranceExpiry: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired!
        pucExpiry: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired!
        lastServiceDate: new Date('2026-05-10'),
        nextServiceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        assignedDriver: null,
      },
    ];

    const insertedVehicles = await Vehicle.insertMany(vehiclesData);

    // Link vehicle reference back onto drivers
    await Driver.findByIdAndUpdate(insertedDrivers[0]._id, { assignedVehicle: insertedVehicles[1]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[1]._id, { assignedVehicle: insertedVehicles[0]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[2]._id, { assignedVehicle: insertedVehicles[4]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[3]._id, { assignedVehicle: insertedVehicles[2]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[4]._id, { assignedVehicle: insertedVehicles[6]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[5]._id, { assignedVehicle: insertedVehicles[5]._id });
    await Driver.findByIdAndUpdate(insertedDrivers[6]._id, { assignedVehicle: insertedVehicles[3]._id });

    console.log('[Seed] Inserting 16 Real Shipments with tracking workflows...');
    const shipmentsData = [
      {
        shipmentId: 'SHP-9021',
        customerName: 'Havells India Ltd (Neemrana Plant)',
        customerPhone: '+91 98110 54321',
        pickupAddress: 'Plot 4, Industrial Area Phase II, Neemrana, Rajasthan',
        deliveryAddress: 'Logistics Hub, Okhla Industrial Area Phase III, New Delhi',
        packageDescription: 'Electrical Switchgears and Distribution Panels',
        packageWeight: 8400,
        vehicle: insertedVehicles[0]._id,
        driver: insertedDrivers[1]._id,
        priority: 'High',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'In Transit',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 24 * 3600 * 1000), note: 'Consignment confirmed by customer dispatch', updatedBy: 'Pooja Deshmukh' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 20 * 3600 * 1000), note: 'Assigned to Vehicle DL 01 AB 4921 / Driver Vikram Singh', updatedBy: 'Pooja Deshmukh' },
          { status: 'Picked Up', timestamp: new Date(Date.now() - 14 * 3600 * 1000), note: 'Loaded at Neemrana Factory gate', updatedBy: 'Vikram Singh Shekhawat' },
          { status: 'In Transit', timestamp: new Date(Date.now() - 6 * 3600 * 1000), note: 'Crossed Dharuhera border checkpost on NH-48', updatedBy: 'Vikram Singh Shekhawat' },
        ],
        deliveryNotes: 'Handle with care: Fragile industrial switches and ceramic insulation.',
      },
      {
        shipmentId: 'SHP-9022',
        customerName: 'Hero MotoCorp Warehouse',
        customerPhone: '+91 99100 87654',
        pickupAddress: 'Sector 33, Infocity, Gurgaon, Haryana',
        deliveryAddress: 'Sitapura Industrial Area Phase IV, Jaipur, Rajasthan',
        packageDescription: 'Two-wheeler Spare Components & Engine Castings',
        packageWeight: 11200,
        vehicle: insertedVehicles[2]._id,
        driver: insertedDrivers[3]._id,
        priority: 'Urgent',
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        status: 'Out for Delivery',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 48 * 3600 * 1000), note: 'High priority urgent restocking order', updatedBy: 'Arunav Sengupta' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 40 * 3600 * 1000), note: 'Assigned to Eicher Pro RJ 14 GC 1940', updatedBy: 'Pooja Deshmukh' },
          { status: 'Picked Up', timestamp: new Date(Date.now() - 30 * 3600 * 1000), note: 'Loaded at Gurgaon central parts hub', updatedBy: 'Gurpreet Singh' },
          { status: 'In Transit', timestamp: new Date(Date.now() - 16 * 3600 * 1000), note: 'Dispatched through Delhi-Mumbai Expressway corridor', updatedBy: 'Gurpreet Singh' },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 2 * 3600 * 1000), note: 'Entered Jaipur ring road toward Sitapura destination', updatedBy: 'Gurpreet Singh' },
        ],
        deliveryNotes: 'Target gate entry before 4:00 PM required by client.',
      },
      {
        shipmentId: 'SHP-9023',
        customerName: 'Reliance Retail Supply Chain',
        customerPhone: '+91 98200 45678',
        pickupAddress: 'Bhiwandi Logistics Park, Building C-4, Thane, Maharashtra',
        deliveryAddress: 'Chakan MIDC Phase II, Pune, Maharashtra',
        packageDescription: 'FMCG Packaged Goods & Dry Grocery Inventory',
        packageWeight: 18500,
        vehicle: insertedVehicles[3]._id,
        driver: insertedDrivers[6]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 18 * 60 * 60 * 1000),
        status: 'In Transit',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 18 * 3600 * 1000), note: 'Bulk grocery run scheduled', updatedBy: 'Pooja Deshmukh' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 16 * 3600 * 1000), note: 'Assigned to BharatBenz MH 12 RN 8302', updatedBy: 'Pooja Deshmukh' },
          { status: 'Picked Up', timestamp: new Date(Date.now() - 8 * 3600 * 1000), note: 'Weighbridge cleared at Bhiwandi park', updatedBy: 'Manoj Verma' },
          { status: 'In Transit', timestamp: new Date(Date.now() - 4 * 3600 * 1000), note: 'Ascending Mumbai-Pune Expressway ghat section', updatedBy: 'Manoj Verma' },
        ],
        deliveryNotes: 'Standard dock delivery at bay #14.',
      },
      {
        shipmentId: 'SHP-9024',
        customerName: 'Apollo Tyres Regional Depot',
        customerPhone: '+91 98450 11223',
        pickupAddress: 'Transport Nagar, Ring Road, Lucknow, Uttar Pradesh',
        deliveryAddress: 'UPSIDC Industrial Area, Kanpur Dehat, Uttar Pradesh',
        packageDescription: 'Commercial Truck & Bus Radial Tyres (160 units)',
        packageWeight: 9600,
        vehicle: insertedVehicles[1]._id,
        driver: insertedDrivers[0]._id, // Assigned to Rajesh Kumar
        priority: 'Standard',
        createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'Assigned',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 12 * 3600 * 1000), note: 'Booking confirmed', updatedBy: 'Pooja Deshmukh' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 6 * 3600 * 1000), note: 'Assigned to Ashok Leyland HR 26 DR 5821 / Driver Rajesh Kumar', updatedBy: 'Pooja Deshmukh' },
        ],
        deliveryNotes: 'Vehicle inspection required before loading at depot.',
      },
      {
        shipmentId: 'SHP-9025',
        customerName: 'Maruti Suzuki India Limited',
        customerPhone: '+91 98101 98765',
        pickupAddress: 'Palam Gurgaon Road, Maruti Complex, Gurgaon, Haryana',
        deliveryAddress: 'Sanand GIDC Phase II, Ahmedabad, Gujarat',
        packageDescription: 'Precision Stamped Body Panels and Trim Modules',
        packageWeight: 14200,
        vehicle: null,
        driver: null,
        priority: 'High',
        createdDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: 'Pending',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 4 * 3600 * 1000), note: 'Order registered in system, awaiting fleet assignment', updatedBy: 'Arunav Sengupta' },
        ],
        deliveryNotes: 'Requires closed container vehicle with waterproof tarp.',
      },
      {
        shipmentId: 'SHP-9026',
        customerName: 'Cadila Pharmaceuticals',
        customerPhone: '+91 98791 22334',
        pickupAddress: 'Dholka Plant, Ahmedabad District, Gujarat',
        deliveryAddress: 'Bhiwandi Cold Chain Facility, Thane, Maharashtra',
        packageDescription: 'Temperature-Controlled Vaccines & Active Pharma (2-8°C)',
        packageWeight: 5200,
        vehicle: null,
        driver: null,
        priority: 'Urgent',
        createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
        status: 'Pending',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 2 * 3600 * 1000), note: 'Reefer truck requested for cold chain shipment', updatedBy: 'Pooja Deshmukh' },
        ],
        deliveryNotes: 'Strict temperature data logging mandatory throughout route.',
      },
      {
        shipmentId: 'SHP-9027',
        customerName: 'Tata Steel Processing Depot',
        customerPhone: '+91 94330 99887',
        pickupAddress: 'Sector 58, Faridabad Industrial Belt, Haryana',
        deliveryAddress: 'Pankhi Industrial Area, Kanpur, Uttar Pradesh',
        packageDescription: 'Cold Rolled Steel Coils and Angle Strips',
        packageWeight: 22000,
        vehicle: null,
        driver: null,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 60 * 60 * 1000),
        status: 'Pending',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 8 * 3600 * 1000), note: 'Heavy payload booking registered', updatedBy: 'Pooja Deshmukh' },
        ],
        deliveryNotes: 'Crane unloading required at destination.',
      },
      // Delivered shipments
      {
        shipmentId: 'SHP-9015',
        customerName: 'Godrej Consumer Products',
        customerPhone: '+91 98202 33445',
        pickupAddress: 'Vikhroli West, Mumbai, Maharashtra',
        deliveryAddress: 'Hadapsar Industrial Estate, Pune, Maharashtra',
        packageDescription: 'Personal Care & Home Hygiene Products',
        packageWeight: 7500,
        vehicle: insertedVehicles[3]._id,
        driver: insertedDrivers[6]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 5 * 3600 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000), note: 'Booking registered', updatedBy: 'Pooja Deshmukh' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 2 * 3600 * 1000), note: 'Assigned to Manoj Verma', updatedBy: 'Pooja Deshmukh' },
          { status: 'Picked Up', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 4 * 3600 * 1000), note: 'Loaded at Vikhroli warehouse', updatedBy: 'Manoj Verma' },
          { status: 'In Transit', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000), note: 'Transited expressway toll', updatedBy: 'Manoj Verma' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 5 * 3600 * 1000), note: 'Delivered safely at Pune receiving bay. Signed by Mr. Kulkarni', updatedBy: 'Manoj Verma' },
        ],
        deliveryNotes: 'All cartons verified intact with barcodes.',
        recipientSignedBy: 'Vikas Kulkarni (Store In-Charge)',
      },
      {
        shipmentId: 'SHP-9016',
        customerName: 'Asian Paints Regional Distribution',
        customerPhone: '+91 98188 12345',
        pickupAddress: 'Kasna Industrial Area, Greater Noida, Uttar Pradesh',
        deliveryAddress: 'Transport Nagar, Jaipur, Rajasthan',
        packageDescription: 'Architectural Paints & Primer Buckets (420 drums)',
        packageWeight: 12500,
        vehicle: insertedVehicles[0]._id,
        driver: insertedDrivers[1]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000), note: 'Order created', updatedBy: 'Pooja Deshmukh' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000), note: 'Delivered and acknowledged at Jaipur depot', updatedBy: 'Vikram Singh Shekhawat' },
        ],
        recipientSignedBy: 'Mahesh Sharma',
      },
      {
        shipmentId: 'SHP-9017',
        customerName: 'Mother Dairy Fruit & Vegetable Pvt Ltd',
        customerPhone: '+91 98111 67890',
        pickupAddress: 'Patparganj Dairy Plant, Delhi',
        deliveryAddress: 'Sector 62 Institutional Area, Noida, Uttar Pradesh',
        packageDescription: 'Fresh Dairy Products and Butter Packets',
        packageWeight: 4200,
        vehicle: insertedVehicles[6]._id,
        driver: insertedDrivers[4]._id,
        priority: 'Urgent',
        createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 8 * 3600 * 1000),
        actualDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 7 * 3600 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000), note: 'Fresh morning distribution run', updatedBy: 'Pooja Deshmukh' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 7 * 3600 * 1000), note: 'Delivered on time', updatedBy: 'Amit Sharma' },
        ],
        recipientSignedBy: 'Sunil Rawat',
      },
      {
        shipmentId: 'SHP-9018',
        customerName: 'Jindal Steel & Power',
        customerPhone: '+91 98102 77889',
        pickupAddress: 'Industrial Model Township (IMT) Manesar, Haryana',
        deliveryAddress: 'GIDC Industrial Estate, Vadodara, Gujarat',
        packageDescription: 'Structural Steel Beams and Fasteners',
        packageWeight: 19800,
        vehicle: insertedVehicles[2]._id,
        driver: insertedDrivers[3]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 15 * 24 * 3600 * 1000), note: 'Industrial freight booked', updatedBy: 'Pooja Deshmukh' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 13 * 24 * 3600 * 1000), note: 'Delivered at Vadodara site dock', updatedBy: 'Gurpreet Singh' },
        ],
        recipientSignedBy: 'Devendra Mehta',
      },
      {
        shipmentId: 'SHP-9019',
        customerName: 'Dabur India Limited',
        customerPhone: '+91 98103 44556',
        pickupAddress: 'Sahibabad Industrial Area Site 4, Ghaziabad, Uttar Pradesh',
        deliveryAddress: 'Transport Nagar, Dehradun, Uttarakhand',
        packageDescription: 'Ayurvedic Healthcare & Juices Inventory',
        packageWeight: 8900,
        vehicle: insertedVehicles[1]._id,
        driver: insertedDrivers[0]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 20 * 24 * 3600 * 1000), note: 'Consignment confirmed', updatedBy: 'Arunav Sengupta' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 19 * 24 * 3600 * 1000), note: 'Delivered to Dehradun C&F agent', updatedBy: 'Rajesh Kumar' },
        ],
        recipientSignedBy: 'Anil Joshi',
      },
      {
        shipmentId: 'SHP-9020',
        customerName: 'Voltas Limited Logistics',
        customerPhone: '+91 98205 66778',
        pickupAddress: 'Pantnagar Industrial Estate, Rudrapur, Uttarakhand',
        deliveryAddress: 'Kundli Industrial Belt, Sonipat, Haryana',
        packageDescription: 'Commercial Inverter Air Conditioners (120 units)',
        packageWeight: 6800,
        vehicle: insertedVehicles[4]._id,
        driver: insertedDrivers[2]._id,
        priority: 'Low',
        createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Delivered', timestamp: new Date(Date.now() - 24 * 24 * 3600 * 1000), note: 'Delivered and stacked in Sonipat warehouse', updatedBy: 'Suresh Patel' },
        ],
        recipientSignedBy: 'Rajeev Bhatia',
      },
      {
        shipmentId: 'SHP-9014',
        customerName: 'Larsen & Toubro Construction',
        customerPhone: '+91 99300 11442',
        pickupAddress: 'Hazira Manufacturing Complex, Surat, Gujarat',
        deliveryAddress: 'JNPT Port Logistics Yard, Navi Mumbai, Maharashtra',
        packageDescription: 'Fabricated Structural Heavy Pipe Assemblies',
        packageWeight: 24000,
        vehicle: insertedVehicles[0]._id,
        driver: insertedDrivers[1]._id,
        priority: 'High',
        createdDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Delivered', timestamp: new Date(Date.now() - 33 * 24 * 3600 * 1000), note: 'Delivered and passed crane inspection', updatedBy: 'Vikram Singh Shekhawat' },
        ],
        recipientSignedBy: 'Harish Rane',
      },
      {
        shipmentId: 'SHP-9013',
        customerName: 'Bhilwara Textiles Export',
        customerPhone: '+91 94141 33221',
        pickupAddress: 'Bhilwara Growth Centre, Rajasthan',
        deliveryAddress: 'Mundra Port SEZ, Kutch, Gujarat',
        packageDescription: 'Finished Cotton Fabric Bales for Container Loading',
        packageWeight: 13000,
        vehicle: insertedVehicles[2]._id,
        driver: insertedDrivers[3]._id,
        priority: 'Standard',
        createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000),
        status: 'Delivered',
        timeline: [
          { status: 'Delivered', timestamp: new Date(Date.now() - 43 * 24 * 3600 * 1000), note: 'Port customs clearance gate entered', updatedBy: 'Gurpreet Singh' },
        ],
        recipientSignedBy: 'Kishore Trivedi',
      },
      {
        shipmentId: 'SHP-9012',
        customerName: 'Bata India Distribution',
        customerPhone: '+91 98300 77665',
        pickupAddress: 'Batanagar Factory, Kolkata, West Bengal',
        deliveryAddress: 'Transport Nagar, Kanpur, Uttar Pradesh',
        packageDescription: 'Footwear & Retail Display Materials (350 cartons)',
        packageWeight: 6200,
        vehicle: null,
        driver: null,
        priority: 'Low',
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        status: 'Cancelled',
        timeline: [
          { status: 'Order Created', timestamp: new Date(Date.now() - 15 * 24 * 3600 * 1000), note: 'Order registered', updatedBy: 'Pooja Deshmukh' },
          { status: 'Cancelled', timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000), note: 'Cancelled on customer request due to route reschedule', updatedBy: 'Arunav Sengupta' },
        ],
        deliveryNotes: 'Order cancelled by customer. No charges applied.',
      },
    ];

    await Shipment.insertMany(shipmentsData);

    console.log('[Seed] Inserting Maintenance Records...');
    const maintenanceData = [
      {
        vehicle: insertedVehicles[5]._id, // UP 32 BN 4410
        serviceType: 'Engine Overhaul',
        serviceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Piston ring wear diagnosed during heavy load climb; fuel injector nozzle replacement and head gasket overhaul.',
        cost: 38500,
        workshop: 'Mahindra Authorized Commercial Workshop, Transport Nagar, Lucknow',
        nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        odometerAtService: 95400,
        invoiceNumber: 'M&M-LKO-2026-904',
      },
      {
        vehicle: insertedVehicles[1]._id, // HR 26 DR 5821
        serviceType: 'Scheduled Service',
        serviceDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        description: '90,000 km mandatory periodic service inspection, differential oil top-up, air filter cartridge replacement.',
        cost: 16800,
        workshop: 'Ashok Leyland Service Station, Sector 18, Gurgaon',
        nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        odometerAtService: 89400,
        invoiceNumber: 'AL-GGN-2026-118',
      },
      {
        vehicle: insertedVehicles[0]._id, // DL 01 AB 4921
        serviceType: 'Brake Replacement',
        serviceDate: new Date('2026-08-10'),
        description: 'Front and rear brake liner relining, pneumatic brake air chamber leak fix, wheel drum resurfacing.',
        cost: 24600,
        workshop: 'Tata Motors Commercial Service Hub, Mayapuri, New Delhi',
        nextServiceDate: new Date('2026-12-10'),
        status: 'Completed',
        odometerAtService: 71800,
        invoiceNumber: 'TM-DEL-2026-582',
      },
      {
        vehicle: insertedVehicles[3]._id, // MH 12 RN 8302
        serviceType: 'Tire Replacement',
        serviceDate: new Date('2026-08-15'),
        description: 'Replacement of 4 rear drive axle radials (Apollo EnduRace RT) and 3D computer wheel alignment.',
        cost: 68400,
        workshop: 'MRF Fleet Tyres Hub, Chakan MIDC, Pune',
        nextServiceDate: new Date('2026-11-20'),
        status: 'Completed',
        odometerAtService: 108900,
        invoiceNumber: 'MRF-PUN-2026-441',
      },
      {
        vehicle: insertedVehicles[2]._id, // RJ 14 GC 1940
        serviceType: 'Oil & Filter Change',
        serviceDate: new Date('2026-09-05'),
        description: 'Mobil Delvac synthetic commercial 15W-40 engine oil refill (28 litres), fuel filters & primary water separator replacement.',
        cost: 14200,
        workshop: 'Eicher Commercial Workshop, Vishwakarma Industrial Area (VKI), Jaipur',
        nextServiceDate: new Date('2026-12-05'),
        status: 'Completed',
        odometerAtService: 39800,
        invoiceNumber: 'EIC-JAI-2026-729',
      },
      {
        vehicle: insertedVehicles[6]._id, // DL 03 CD 7190 Reefer
        serviceType: 'Scheduled Service',
        serviceDate: new Date('2026-08-25'),
        description: 'Carrier Transicold refrigeration unit compressor refrigerant check, secondary cooling alternator belt replacement.',
        cost: 29500,
        workshop: 'Carrier Reefer Service Point, Kundli, Haryana',
        nextServiceDate: new Date('2026-11-25'),
        status: 'Completed',
        odometerAtService: 62400,
        invoiceNumber: 'CAR-KUN-2026-310',
      },
    ];

    await Maintenance.insertMany(maintenanceData);

    console.log('[Seed] Inserting Fuel Records with calculations...');
    const fuelData = [
      {
        vehicle: insertedVehicles[0]._id, // DL 01 AB 4921
        driver: insertedDrivers[1]._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 165,
        pricePerLitre: 94.8,
        totalCost: 15642,
        odometerReading: 74210,
        fuelStation: 'Indian Oil Swagat COCO Outlet, Neemrana NH-48',
        receiptNumber: 'IOC-NEEM-8910',
      },
      {
        vehicle: insertedVehicles[2]._id, // RJ 14 GC 1940
        driver: insertedDrivers[3]._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 140,
        pricePerLitre: 93.5,
        totalCost: 13090,
        odometerReading: 41200,
        fuelStation: 'Bharat Petroleum Highway King, Shahpura Toll Plaza',
        receiptNumber: 'BPCL-SHA-4402',
      },
      {
        vehicle: insertedVehicles[3]._id, // MH 12 RN 8302
        driver: insertedDrivers[6]._id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 190,
        pricePerLitre: 92.4,
        totalCost: 17556,
        odometerReading: 112500,
        fuelStation: 'HPCL Auto Care, Khalapur Toll, Mumbai-Pune Expressway',
        receiptNumber: 'HPCL-KHA-1029',
      },
      {
        vehicle: insertedVehicles[1]._id, // HR 26 DR 5821
        driver: insertedDrivers[0]._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 110,
        pricePerLitre: 95.2,
        totalCost: 10472,
        odometerReading: 89400,
        fuelStation: 'Indian Oil Corporation, IFFCO Chowk, Gurgaon',
        receiptNumber: 'IOC-GGN-7731',
      },
      {
        vehicle: insertedVehicles[4]._id, // GJ 01 TX 9942 CNG
        driver: insertedDrivers[2]._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        fuelType: 'CNG',
        litres: 65,
        pricePerLitre: 82.5,
        totalCost: 5362.5,
        odometerReading: 32150,
        fuelStation: 'Gujarat Gas CNG Mega Station, Sanand Highway',
        receiptNumber: 'GGL-SAN-2210',
      },
      {
        vehicle: insertedVehicles[6]._id, // DL 03 CD 7190
        driver: insertedDrivers[4]._id,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 135,
        pricePerLitre: 94.5,
        totalCost: 12757.5,
        odometerReading: 64800,
        fuelStation: 'Bharat Petroleum, GT Road Kundli, Sonipat',
        receiptNumber: 'BPCL-KUN-8843',
      },
      {
        vehicle: insertedVehicles[0]._id, // DL 01 AB 4921
        driver: insertedDrivers[1]._id,
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 170,
        pricePerLitre: 94.6,
        totalCost: 16082,
        odometerReading: 72800,
        fuelStation: 'Reliance Petroleum Highway Care, Kotputli',
        receiptNumber: 'RIL-KOT-5519',
      },
      {
        vehicle: insertedVehicles[2]._id, // RJ 14 GC 1940
        driver: insertedDrivers[3]._id,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        fuelType: 'Diesel',
        litres: 155,
        pricePerLitre: 93.8,
        totalCost: 14539,
        odometerReading: 39900,
        fuelStation: 'Indian Oil COCO, Behror, Rajasthan',
        receiptNumber: 'IOC-BEH-3391',
      },
    ];

    await FuelRecord.insertMany(fuelData);

    console.log('[Seed] Inserting Route corridors...');
    const routesData = [
      {
        routeCode: 'RT-DEL-JAI',
        title: 'Delhi NCR - Jaipur Industrial Golden Quadrilateral',
        originCity: 'Gurgaon, Haryana (IMT Manesar Hub)',
        destinationCity: 'Jaipur, Rajasthan (Sitapura Industrial Area)',
        distanceKm: 260,
        estimatedDurationHours: 5.5,
        assignedVehicle: insertedVehicles[0]._id,
        assignedDriver: insertedDrivers[1]._id,
        currentStatus: 'In Progress',
        tollExpensesEstimated: 850,
        waypoints: [
          { name: 'IMT Manesar Central Hub', city: 'Gurgaon', order: 1, isCompleted: true },
          { name: 'Dharuhera Toll Plaza', city: 'Rewari', order: 2, isCompleted: true },
          { name: 'Shahpura Expressway Junction', city: 'Shahpura', order: 3, isCompleted: true },
          { name: 'Sitapura Industrial Phase IV', city: 'Jaipur', order: 4, isCompleted: false },
        ],
      },
      {
        routeCode: 'RT-MUM-PUN',
        title: 'Mumbai Port - Pune Automotive Belt Corridor',
        originCity: 'Bhiwandi, Thane, Maharashtra',
        destinationCity: 'Chakan MIDC, Pune, Maharashtra',
        distanceKm: 155,
        estimatedDurationHours: 3.8,
        assignedVehicle: insertedVehicles[3]._id,
        assignedDriver: insertedDrivers[6]._id,
        currentStatus: 'In Progress',
        tollExpensesEstimated: 420,
        waypoints: [
          { name: 'Bhiwandi Logistics Hub', city: 'Thane', order: 1, isCompleted: true },
          { name: 'Khalapur Toll Plaza (Expressway Start)', city: 'Raigad', order: 2, isCompleted: true },
          { name: 'Kamshet Tunnel Bypass', city: 'Pune Rural', order: 3, isCompleted: true },
          { name: 'Chakan Industrial Gate 2', city: 'Pune', order: 4, isCompleted: false },
        ],
      },
      {
        routeCode: 'RT-DEL-LKO',
        title: 'Delhi NCR - Lucknow Transport Corridor',
        originCity: 'Greater Noida, Uttar Pradesh',
        destinationCity: 'Transport Nagar, Lucknow, Uttar Pradesh',
        distanceKm: 510,
        estimatedDurationHours: 7.5,
        assignedVehicle: insertedVehicles[1]._id,
        assignedDriver: insertedDrivers[0]._id,
        currentStatus: 'Scheduled',
        tollExpensesEstimated: 1250,
        waypoints: [
          { name: 'Greater Noida Depot', city: 'Gautam Buddha Nagar', order: 1, isCompleted: false },
          { name: 'Yamuna Expressway Toll Ag', city: 'Mathura', order: 2, isCompleted: false },
          { name: 'Agra-Lucknow Expressway Interchange', city: 'Agra', order: 3, isCompleted: false },
          { name: 'Transport Nagar Depot', city: 'Lucknow', order: 4, isCompleted: false },
        ],
      },
      {
        routeCode: 'RT-AHM-MUM',
        title: 'Ahmedabad - Mumbai Coastal Logistics Link',
        originCity: 'Sanand GIDC, Ahmedabad, Gujarat',
        destinationCity: 'JNPT Port, Navi Mumbai, Maharashtra',
        distanceKm: 540,
        estimatedDurationHours: 9.0,
        assignedVehicle: insertedVehicles[4]._id,
        assignedDriver: insertedDrivers[2]._id,
        currentStatus: 'Scheduled',
        tollExpensesEstimated: 1100,
        waypoints: [
          { name: 'Sanand Industrial Hub', city: 'Ahmedabad', order: 1, isCompleted: false },
          { name: 'Vadodara Golden Toll', city: 'Vadodara', order: 2, isCompleted: false },
          { name: 'Surat Ring Road Entry', city: 'Surat', order: 3, isCompleted: false },
          { name: 'JNPT Yard', city: 'Navi Mumbai', order: 4, isCompleted: false },
        ],
      },
    ];

    await RoutePlan.insertMany(routesData);

    console.log('[Seed] Generating initial fleet alerts & notifications...');
    const notificationsData = [
      {
        title: 'Routine Maintenance Due: HR 26 DR 5821',
        message: 'Periodic service inspection for Ashok Leyland Ecomet (HR 26 DR 5821) is scheduled within 4 days.',
        type: 'warning',
        category: 'maintenance',
        isRead: false,
        relatedId: insertedVehicles[1]._id.toString(),
        entityModel: 'Vehicle',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        title: 'Insurance Renewal Notice: HR 26 DR 5821',
        message: 'Commercial insurance for Ashok Leyland (HR 26 DR 5821) expires in 20 days. Renewal policy documents required.',
        type: 'warning',
        category: 'insurance',
        isRead: false,
        relatedId: insertedVehicles[1]._id.toString(),
        entityModel: 'Vehicle',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000),
      },
      {
        title: 'PUC Certificate Due: HR 26 DR 5821',
        message: 'Pollution Under Control (PUC) certificate for HR 26 DR 5821 expires in 10 days.',
        type: 'warning',
        category: 'puc',
        isRead: false,
        relatedId: insertedVehicles[1]._id.toString(),
        entityModel: 'Vehicle',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000),
      },
      {
        title: 'Commercial Driver License Expiring: Vikram Singh',
        message: 'Heavy vehicle driving license for Vikram Singh (RJ-1420160081240) expires in 25 days.',
        type: 'critical',
        category: 'license',
        isRead: false,
        relatedId: insertedDrivers[1]._id.toString(),
        entityModel: 'Driver',
        createdAt: new Date(Date.now() - 16 * 3600 * 1000),
      },
      {
        title: 'Vehicle Under Maintenance: UP 32 BN 4410',
        message: 'Mahindra Bolero Maxi Truck (UP 32 BN 4410) entered workshop for Engine Overhaul at Lucknow.',
        type: 'warning',
        category: 'maintenance',
        isRead: true,
        relatedId: insertedVehicles[5]._id.toString(),
        entityModel: 'Vehicle',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      },
      {
        title: 'Shipment Delivered: #SHP-9015',
        message: 'Consignment #SHP-9015 successfully delivered to Godrej Consumer Products at Pune dock.',
        type: 'success',
        category: 'delivery',
        isRead: true,
        relatedId: insertedVehicles[3]._id.toString(),
        entityModel: 'Shipment',
        createdAt: new Date(Date.now() - 96 * 3600 * 1000),
      },
    ];

    await Notification.insertMany(notificationsData);

    console.log('[Seed] Database successfully populated with realistic Indian logistics demo data!');
    console.log('---------------------------------------------------------');
    console.log('Demo Credentials for Evaluation:');
    console.log('Admin:          admin@logistics.hcl.internal          / Admin@2026');
    console.log('Fleet Manager:  manager@logistics.hcl.internal        / Manager@2026');
    console.log('Driver:         rajesh.driver@logistics.hcl.internal  / Driver@2026');
    console.log('---------------------------------------------------------');
    return true;
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = { seedDatabase };

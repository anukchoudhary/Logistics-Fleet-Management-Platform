# Comprehensive Logistics and Fleet Management Platform

An enterprise-grade, full-stack logistics and commercial fleet operations management web application built for transport corporations and supply chain teams. Developed as part of the HCL College Training & Engineering Project.

---

## 1. Project Overview

LogiX Fleet is an operations platform designed for mid-to-large scale logistics providers operating across highway corridors. It provides end-to-end visibility and workflow management across commercial vehicles, drivers, customer consignments, shipment delivery handovers, route corridors, fuel disbursements, preventative maintenance, compliance expirations (insurance, PUC, driver licenses), and executive reporting.

The platform includes real-time database state synchronization: when a commercial driver completes a consignment delivery at a destination warehouse, the backend logic automatically shifts the shipment to `Delivered`, records the proof-of-delivery acknowledgement, and frees both the vehicle and driver back to `Available` status.

---

## 2. Key Features & Modules

### Authentication & Role-Based Access Control (RBAC)
* **Real JWT Authentication** with bcrypt password hashing.
* **Three Functional Roles:**
  * **Admin:** Full system control, user provisioning, deletion permissions.
  * **Fleet Manager:** Operations management (vehicles, drivers, dispatches, fuel, maintenance, route planning).
  * **Commercial Driver:** Dedicated delivery console to view assigned trips, record milestones, add delivery notes, and submit proof-of-delivery.
* **One-Click Demo Authentication Switcher** on the login page for rapid evaluation.

### Command Dashboard
* **Real Database KPIs:** Total Vehicles, Available vs. Active Vehicles, Total Drivers, Active Shipments, Delivered Shipments, Pending Dispatch, Service Inspections Due, and Total Fuel Expense.
* **Interactive Visualizations (Recharts):**
  * Monthly Consignment Deliveries Trend (Booked vs. Fulfilled).
  * Vehicle Fleet Utilization (Donut breakdown of Available, In Transit, Maintenance, Inactive).
  * Operating Expenses (Monthly Fuel spend vs. Maintenance repairs).
  * Shipment Status Pipeline.
* **Live Consignments Quick View:** Immediate status monitoring of recent transport waybills.

### Commercial Vehicle Management
* **Fields:** Vehicle ID, Registration Plate (Indian commercial formats), Make, Model, Classification (HCV, MCV, LCV, Trailer, Reefer), Manufacturing Year, Payload Capacity (kg), Fuel Type, Odometer (km), Status, Insurance Expiry, PUC Expiry, Last Service Date, Next Scheduled Service.
* **Workflows:** Add, edit, delete, search by plate/brand/model, filter by classification and fuel type.
* **Vehicle Detail Profile:** Technical specs, dedicated driver card, maintenance work order history, shipment history, and fuel refill logs.

### Commercial Driver Directory
* **Fields:** Driver ID, Full Name, Mobile Number, Email, Commercial License Number (DL-xxx, RJ-xxx), License Expiry Date, Heavy Vehicle Driving Experience, Dedicated Vehicle, Operational Status, Emergency Contact.
* **Workflows:** Driver onboarding, truck assignment, delivery statistics (completed vs. active), and complete consignment history.

### Consignment & Shipment Dispatch
* **Fields:** Waybill ID (`SHP-xxxx`), Customer Name & Phone, Origin Pickup Address, Delivery Destination, Cargo Description, Payload Weight (kg), Vehicle, Driver, Priority (Low, Standard, High, Urgent), Expected Delivery Date, Actual Delivery Date.
* **Interactive Visual Dispatch Timeline:** Chronological milestones (`Order Created` &rarr; `Assigned` &rarr; `Picked Up` &rarr; `In Transit` &rarr; `Out for Delivery` &rarr; `Delivered`).
* **Proof of Delivery (POD):** Captures consignee signature acknowledgement upon delivery.

### Dedicated Driver Delivery Console
* Driver-specific view listing active assigned consignments.
* Milestone progression (`Picked Up` &rarr; `In Transit` &rarr; `Out for Delivery` &rarr; `Delivered`).
* Status transitions handled via backend business logic (frees assigned vehicle and driver back to `Available` upon delivery).

### Highway Route Management
* Visual corridor management between major Indian logistics hubs (Delhi-NCR, Gurgaon, Jaipur, Mumbai, Pune, Lucknow, Ahmedabad).
* Metrics: Origin, destination, distance (km), estimated duration (hours), assigned vehicle and driver, checkpoints/land tolls, and toll budgeting.

### Fuel Management & Analytics
* Fields: Vehicle, Driver, Date, Fuel Type (Diesel, CNG), Litres, Price Per Litre, Total Cost, Odometer, Fuel Station, Receipt No.
* Auto-calculates `Total Cost = Litres × Price Per Litre`.
* Automatically updates vehicle odometer if reading is higher.
* Analytics cards: Total expense, total litres consumed, average price per litre, monthly expense bar chart, vehicle-wise fuel consumption breakdown.

### Maintenance & Service Due Engine
* Fields: Vehicle, Service Classification (Scheduled Service, Engine Overhaul, Brake Replacement, Tire Replacement, Oil & Filter Change), Date, Cost, Workshop, Next Service Date, Odometer at Service, Invoice No.
* Approaching inspection alerts: Proactively flags vehicles whose next service date is within 14 days or overdue.
* Automatically sets vehicle status to `Maintenance` during work and restores to `Available` upon completion.

### Proactive Fleet Compliance & Notification Engine
* Auto-scans fleet database and fires alerts for:
  * Commercial Vehicle Insurance expiring within 30 days.
  * Pollution Under Control (PUC) certificate expiring within 15 days.
  * Heavy Vehicle Driver License expiring within 30 days.
  * Routine scheduled maintenance inspection due within 7 days.
  * Shipment dispatch and delivery handover events.

### Reports & CSV Export
* Tabular reports with date range filtering:
  * Fleet Utilization & Compliance Report.
  * Delivery Performance Report.
  * Driver Performance Report.
  * Fuel Expenses & Consumption Report.
  * Maintenance & Repairs Audit Report.
* One-click CSV export utility to download actual `.csv` files for executive auditing.

---

## 3. Technology Stack

### Frontend
* **React 18** with **Vite** (fast HMR and optimized production bundles).
* **React Router v6** (declarative client routing and role-protected routes).
* **Axios** (centralized API client with JWT interceptors and auto-token injection).
* **Recharts** (lightweight SVG charts: BarChart, LineChart, PieChart).
* **Lucide React** (consistent enterprise icons).
* **Vanilla CSS (index.css)** (tailored enterprise design system, restrained slate/navy color palette, no AI gradients/glassmorphism).

### Backend
* **Node.js & Express.js** (REST API service).
* **MongoDB & Mongoose** (flexible ODM schemas, references, pre-save hooks, timestamps).
* **Dual Database Architecture:**
  * **Production:** Connects to **MongoDB Atlas** or external MongoDB URI via `MONGO_URI`.
  * **Development / Testing Fallback:** Automatically spins up **`mongodb-memory-server`** when `MONGO_URI` is omitted, guaranteeing that the application and its seed data work out of the box anywhere without requiring a running MongoDB daemon.
* **Authentication:** **JWT (JSON Web Tokens)** + **bcryptjs** (10-round salted password hashing).
* **CORS & Morgan** (CORS middleware for cross-origin frontend support; Morgan request logging).

---

## 4. Project Structure

```
d:\HCL tech\
├── client/                     # Frontend React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Brand logos & static assets
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/              # Application views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Deliveries.jsx
│   │   │   ├── DriverDetails.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Fuel.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ShipmentDetails.jsx
│   │   │   ├── Shipments.jsx
│   │   │   ├── VehicleDetails.jsx
│   │   │   └── Vehicles.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios client with interceptors
│   │   ├── utils/
│   │   │   ├── exportCsv.js    # Browser CSV exporter
│   │   │   └── formatters.js   # INR currency and date formatters
│   │   ├── App.jsx
│   │   ├── index.css           # Clean enterprise CSS design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json             # Vercel SPA routing rewrite
│   └── vite.config.js
│
├── server/                     # Backend Node + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MongoDB Atlas & MongoMemoryServer fallback
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── driverController.js
│   │   │   ├── fuelController.js
│   │   │   ├── maintenanceController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reportController.js
│   │   │   ├── routeController.js
│   │   │   ├── shipmentController.js
│   │   │   └── vehicleController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification & role authorization
│   │   │   └── errorMiddleware.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Driver.js
│   │   │   ├── FuelRecord.js
│   │   │   ├── Maintenance.js
│   │   │   ├── Notification.js
│   │   │   ├── RoutePlan.js
│   │   │   ├── Shipment.js
│   │   │   ├── User.js
│   │   │   └── Vehicle.js
│   │   ├── routes/             # Express API route declarations
│   │   ├── seed/
│   │   │   └── seedData.js     # Realistic Indian logistics seed dataset
│   │   ├── test/
│   │   │   └── integrationTest.js # Automated 11-step integration test suite
│   │   ├── utils/
│   │   │   └── notificationHelper.js # Proactive compliance alert scanner
│   │   └── server.js           # Server bootstrap and entry point
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
├── .gitignore
├── .env.example
├── package.json                # Root management scripts
├── render.yaml                 # Render Blueprint configuration
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 5. Demo Credentials

The platform contains realistic Indian logistics demo accounts seeded automatically upon first launch:

| Role | Name | Email | Password | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Arunav Sengupta | `admin@logistics.hcl.internal` | `Admin@2026` | Full platform & user management |
| **Fleet Manager** | Pooja Deshmukh | `manager@logistics.hcl.internal` | `Manager@2026` | Vehicles, drivers, dispatches, maintenance |
| **Commercial Driver** | Rajesh Kumar | `rajesh.driver@logistics.hcl.internal` | `Driver@2026` | Assigned deliveries console & status updates |

*Tip: On the `/login` page, you can click on any of the three demo buttons to automatically populate these credentials.*

---

## 6. Installation & Local Setup

### Prerequisites
* **Node.js** (v18.x, v20.x, or v22+)
* **npm** or **yarn**
* *(Optional)* MongoDB Atlas connection string (if omitted, in-memory MongoDB will be used automatically for zero-friction evaluation).

### Step 1: Clone or Navigate to the Workspace
```bash
git clone <repository-url>
cd "HCL tech"
```

### Step 2: Install Dependencies
Run from the root directory:
```bash
# Install both backend and frontend dependencies
npm --prefix server install
npm --prefix client install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Default `server/.env` parameters:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/logistics_fleet?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_logistics_fleet_2026
CLIENT_URL=http://localhost:5173
```
*(If `MONGO_URI` is left unconfigured or contains `<username>`, the server automatically boots an in-memory database instance).*

### Step 4: Run the Backend & Seed Demo Data
```bash
# Seed the database directly (optional, auto-seeds on first launch if empty)
cd server
npm run seed

# Start Express server in development mode
npm run dev
# Server runs on: http://localhost:5000
```

### Step 5: Start the Frontend Client
In a new terminal window:
```bash
cd client
npm run dev
# Client runs on: http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 7. Running the Automated Integration Test Suite

The project includes an automated 11-step integration test suite (`server/src/test/integrationTest.js`) that validates authentication, vehicle/driver CRUD, shipment state transitions, and automatic resource reallocation:

```bash
cd server
npm run test:integration
```

Expected output:
```
[Test] Starting comprehensive end-to-end integration test...
✓ [1/11] Health check: PASS
✓ [2/11] Admin Login: PASS
✓ [3/11] Driver Login: PASS
✓ [4/11] Vehicles Fetch: PASS (11 vehicles)
✓ [5/11] Drivers Fetch: PASS (8 drivers)
✓ [6/11] Shipments Fetch: PASS (16 shipments)
✓ [7/11] Dashboard KPIs: PASS (Vehicles: 11, Drivers: 8, Active: 4, Delivered: 8, Fuel Exp: ₹105501)
✓ [8/11] Fuel Analytics: PASS (Expense: ₹105501)
✓ [9/11] Maintenance Upcoming Alerts: PASS (3 due)
✓ [10/11] Fleet Notifications: PASS (6 alerts)
✓ [11/11] Backend Delivery Workflow State Sync: PASS (Shipment marked Delivered, Vehicle status automatically reverted to Available)

======================================================
ALL INTEGRATION TESTS PASSED PERFECTLY!
======================================================
```

---

## 8. REST API Reference

### Authentication
* `POST /api/auth/login` - Authenticate user & return JWT token.
* `GET /api/auth/me` - Return currently authenticated profile (Protected).
* `GET /api/auth/users` - List all corporate accounts (Admin only).
* `POST /api/auth/users` - Provision new user account (Admin only).

### Vehicles
* `GET /api/vehicles` - List all vehicles (supports `search`, `status`, `vehicleType`, `page`, `limit`).
* `GET /api/vehicles/:id` - Full vehicle record with maintenance, shipment, and fuel histories.
* `POST /api/vehicles` - Add new commercial vehicle (Manager/Admin).
* `PUT /api/vehicles/:id` - Update vehicle details (Manager/Admin).
* `DELETE /api/vehicles/:id` - Delete vehicle (Admin only).

### Drivers
* `GET /api/drivers` - List drivers with filtering and pagination.
* `GET /api/drivers/:id` - Driver profile with complete trip history.
* `POST /api/drivers` - Onboard commercial driver (Manager/Admin).
* `PUT /api/drivers/:id` - Update driver record (Manager/Admin).
* `PATCH /api/drivers/:id/assign-vehicle` - Allocate dedicated truck.
* `DELETE /api/drivers/:id` - Remove driver (Admin only).

### Shipments & Deliveries
* `GET /api/shipments` - List all consignments with search & filters.
* `GET /api/shipments/:id` - Full consignment details with visual dispatch timeline.
* `POST /api/shipments` - Book new shipment (Manager/Admin).
* `PUT /api/shipments/:id` - Edit shipment & resource assignments (Manager/Admin).
* `PATCH /api/shipments/:id/status` - Progress shipment status and record timeline entry.
* `GET /api/deliveries` - Driver's active delivery trips.
* `PATCH /api/deliveries/:id/update-status` - Progress delivery status; when marked `Delivered`, automatically marks vehicle and driver `Available`.

### Routes, Fuel, Maintenance & Reports
* `GET /api/routes` & `POST /api/routes` - Logistics highway corridors and toll budgets.
* `GET /api/fuel` & `POST /api/fuel` - Refill logs and auto cost computation.
* `GET /api/fuel/analytics` - Monthly fuel expenditures and vehicle-wise consumption.
* `GET /api/maintenance` & `POST /api/maintenance` - Workshop work orders and scheduled services.
* `GET /api/maintenance/upcoming/alerts` - Upcoming inspections due within 14 days or overdue.
* `GET /api/notifications` - Proactive fleet compliance alerts.
* `GET /api/reports/dashboard` - Complete real-time KPI metrics and chart datasets.
* `GET /api/reports/export` - Structured CSV datasets for fleet audits.

---

## 9. Deployment Instructions

### Deploying the Backend to Render / Railway
1. **Repository:** Push the repository to GitHub.
2. **Create New Web Service:** Select Render or Railway and point to your repository.
3. **Root Directory:** Set to `server` (or use the root `render.yaml`).
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment Variables:**
   * `NODE_ENV`: `production`
   * `PORT`: `5000` (or leave default on Render)
   * `MONGO_URI`: Your MongoDB Atlas cluster connection string (`mongodb+srv://...`)
   * `JWT_SECRET`: A strong secret key
   * `CLIENT_URL`: Your deployed Vercel frontend URL (e.g., `https://logistics-fleet-app.vercel.app`)

### Deploying the Frontend to Vercel
1. **Import Project:** Select your GitHub repository on Vercel.
2. **Framework Preset:** Vite
3. **Root Directory:** Select `client` (or use root with `vercel.json`).
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   * `VITE_API_BASE_URL`: URL of your deployed Render backend (e.g., `https://logistics-fleet-api.onrender.com`).
7. **Deploy:** Vercel automatically deploys with SPA route fallback handled by `vercel.json`.

---

## 10. Future Enhancement Roadmap
* GPS Telematics IoT gateway integration (OBD-II / CAN-bus hardware data feed).
* Geofencing alerts when trucks enter or leave designated industrial parks.
* FASTag RFID automated toll deduction integration.
* Automated WhatsApp / SMS dispatch notifications to consignees.
* Electronic Waybill (e-Way Bill) GST Portal API synchronization.

---

## 11. Authors & Acknowledgement
* **Project:** Comprehensive Logistics and Fleet Management Platform
* **Program:** HCL Training / College Capstone Engineering Project
* **License:** ISC

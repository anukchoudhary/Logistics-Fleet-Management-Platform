# <DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING>
# <ABES EC, GHAZIABAD>

## SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
### Project Title: Comprehensive Logistics and Fleet Management Platform
**Standard Academic Compliance: IEEE Std 830-1998**  
**Live Production URL:** [https://logistics-fleet-management-platform.vercel.app/login](https://logistics-fleet-management-platform.vercel.app/login)

---

| **SUBMITTED BY:** | **UNDER THE GUIDANCE OF:** |
| :--- | :--- |
| **Student Name:** Anuk Choudhary <br>**Roll No:** 2400321540043 <br>**Degree:** Bachelor of Technology (B.Tech) <br>**Branch:** Computer Science & Engineering <br>**Academic Year:** 2026 – 2027 | **Project Mentor:** Mr. Natesan Rajan <br>**Designation / Title:** Industry / Academic Mentor <br>**Department:** Department of Computer Science & Engg. <br>**Status:** 3rd / Final Year Project Specification <br>**Date of Submission:** 29-Oct-2026 |

---

### Document Revision & Approval History

| Version | Date | Description / Major Changes | Prepared By | Reviewed By |
| :---: | :---: | :--- | :---: | :---: |
| **0.1** | 15-Sep-2026 | Initial Requirement Analysis & Scope Definition | Anuk Choudhary (2400321540043) | Mr. Natesan Rajan |
| **0.5** | 05-Oct-2026 | Database Design, API Schema & Architecture Baseline | Anuk Choudhary (2400321540043) | Mr. Natesan Rajan |
| **1.0** | 29-Oct-2026 | Final Full-Stack Production Implementation & Deployment SRS | Anuk Choudhary (2400321540043) | HOD / Project Evaluation Committee |

> **Guidance Note:** This Software Requirements Specification document conforms to the IEEE 830-1998 standard recommended practice for software system specifications. All functional modules, state synchronizations, interfaces, schemas, and verification metrics describe the deployed full-stack platform.

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to provide a complete, rigorous, and unambiguous description of the **Comprehensive Logistics and Fleet Management Platform (LogiX Fleet)**. It details functional and non-functional requirements, external interfaces, enterprise system architecture, role-based workflows, database schemas, and operational constraints for development, testing, academic lab evaluation, and cloud deployment.

### 1.2 Scope of the System
The platform is a multi-tier, enterprise-grade logistics and fleet resource planning web system engineered for supply chain corporations, transport carriers, dispatch managers, and commercial heavy vehicle drivers. It handles the complete lifecycle of commercial haulage across national logistics corridors.

#### In-Scope Capabilities:
1. **Multi-Role Authentication & Access Governance:** JWT-based stateless authentication with salted bcrypt hashing, enforcing granular Role-Based Access Control (RBAC) across three distinct personas: System Administrator, Fleet Manager, and Commercial Driver.
2. **Commercial Vehicle Fleet Management:** End-to-end lifecycle tracking of commercial vehicles (HCV, MCV, LCV, Trailers, Reefer trucks) with registration records, capacity audits, and automated statutory compliance tracking (Insurance, PUC, and service dates).
3. **Commercial Driver Directory:** Directory of commercial heavy vehicle drivers with license tracking, experience records, safety history, and reciprocal truck-driver pairing.
4. **Consignment Booking & Dispatch Management:** Waybill consignment scheduling, payload calculation, priority flagging (Low, Standard, High, Urgent), vehicle and driver allocation, and milestone timelines.
5. **Real-Time Backend Delivery State Synchronization:** Dedicated driver trip management console allowing status updates (`Picked Up` &rarr; `In Transit` &rarr; `Out for Delivery` &rarr; `Delivered`). Upon delivery handover and recipient proof-of-delivery acknowledgement, backend business logic automatically resets the assigned vehicle and driver to `Available` status.
6. **Logistics Highway Corridor Planning:** Management of designated freight routes with checkpoint tracking, transit time budgeting, and toll expense forecasting.
7. **Fuel Disbursement & Consumption Auditing:** Refill logging with automatic financial calculation (`Total Cost = Litres × Price/Litre`), odometer efficiency auditing, and vehicle-level consumption analytics.
8. **Preventative Maintenance & Proactive Alerts:** Scheduled workshop repairs, servicing cost ledger, and automated early warning alerts for vehicles due for inspection within 14 days or overdue.
9. **Proactive Compliance Engine:** Background telematics scanner tracking insurance expiry (<30 days), PUC expiration (<15 days), driver license renewal (<30 days), and upcoming service dates.
10. **Executive Analytics & CSV Export Engine:** Real-time KPI computing, Recharts-powered distribution dashboards, and dynamic CSV export for administrative audits.

#### Out-of-Scope Boundaries:
* Direct satellite hardware GPS transponder firmware flashing (simulated through physical corridor checkpoints).
* Live banking gateway clearing for freight invoice factoring.
* External customs clearance / border tax gateway integration.

#### Expected Benefits:
* Eliminates double-booking of heavy vehicles and drivers through database state locks.
* Mitigates legal penalties through automated early statutory compliance tracking (PUC, Insurance, License).
* Streamlines consignment custody verification via digital Proof of Delivery (POD) signatures.
* Provides full operational transparency over fuel expenses and maintenance costs.

---

### 1.3 Definitions, Acronyms, and Abbreviations

| Acronym / Term | Definition |
| :--- | :--- |
| **SRS** | Software Requirements Specification (IEEE 830-1998 standard). |
| **RBAC** | Role-Based Access Control (Admin, Fleet Manager, Driver). |
| **JWT** | JSON Web Token (RFC 7519) for secure, stateless client-server authorization. |
| **REST** | Representational State Transfer architectural pattern for HTTP APIs. |
| **POD** | Proof of Delivery — formal recipient sign-off upon consignment receipt. |
| **PUC** | Pollution Under Control certificate mandated under the Motor Vehicles Act. |
| **HCV / MCV / LCV**| Heavy, Medium, and Light Commercial Vehicles classifications. |
| **Reefer** | Refrigerated temperature-controlled commercial freight container. |
| **ODM / Mongoose** | Object Data Modeling library managing MongoDB validation and relationships. |
| **SPA** | Single Page Application built with React.js and Vite. |

---

### 1.4 References
1. **IEEE Std 830-1998:** IEEE Recommended Practice for Software Requirements Specifications.
2. **RFC 7519:** JSON Web Token (JWT) Architecture and Security Guidelines.
3. **React 18 Documentation:** Component Lifecycle, Context API, and Hooks Specifications.
4. **Express.js Framework Reference:** Routing, Middleware, and Central Error Pipeline.
5. **MongoDB 8.0 & Mongoose ODM:** Schema Design, Indexing, and Referencing Practices.
6. **Government of India Ministry of Road Transport & Highways (MoRTH):** Commercial vehicle compliance rules and registration patterns.

---

### 1.5 Document Overview
* **Section 2:** Overall description, user classes, operational environment, and architectural constraints.
* **Section 3:** Functional requirements organized by system modules.
* **Section 4:** External interface requirements (UI, Hardware, Software, Network).
* **Section 5:** Non-functional requirements (Performance, Security, Reliability, Maintainability).
* **Section 6:** System analysis and design diagrams (Architecture, DFD, Sequence, and Schema).
* **Section 7:** Academic review, evaluation rubrics, and formal sign-off.

---

## 2. Overall Description

### 2.1 Product Perspective & System Flow
The **LogiX Fleet** platform is a complete, self-contained, multi-tier web application. The frontend client (React + Vite) communicates with the backend REST API server (Node.js + Express) over HTTPS using JSON payloads. Data persistence is managed via MongoDB Atlas with automatic development fallback.

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (React 18 + Vite)                     |
|  - Auth & Notification Context    - Protected Route Router                    |
|  - Recharts KPI Dashboards        - Operational Tables & CSV Exporters        |
+-------------------------------------------------------------------------------+
                                        | (HTTPS / JSON + JWT Bearer)
                                        v
+-------------------------------------------------------------------------------+
|                            SERVER TIER (Node.js + Express)                    |
|  - JWT & RBAC Middleware          - Centralized Error Handling Pipeline       |
|  - Restful API Controllers        - Automated Proactive Compliance Scanner    |
+-------------------------------------------------------------------------------+
                                        | (Mongoose ODM / TCP 27017)
                                        v
+-------------------------------------------------------------------------------+
|                           DATABASE TIER (MongoDB Mongoose)                    |
|  - Users Collection               - Vehicles Collection                       |
|  - Drivers Collection             - Shipments & Timelines Collection          |
|  - Fuel Records Collection        - Maintenance Work Orders Collection        |
|  - Routes Collection              - Internal Notifications Collection         |
+-------------------------------------------------------------------------------+
```

---

### 2.2 User Classes and Characteristics

| User Role | Technical Level | System Access Permissions | Core Operational Responsibilities |
| :--- | :---: | :--- | :--- |
| **System Administrator** | High | Unrestricted Read/Write/Delete on all modules and user accounts. | System audit, user provisioning, database maintenance, vehicle/driver purge. |
| **Fleet Manager** | Medium | Management access to Vehicles, Drivers, Shipments, Fuel, Routes, Maintenance, and Reports. | Booking consignments, allocating vehicles and drivers, scheduling maintenance, auditing fuel costs. |
| **Commercial Driver** | Basic | Restricted access to assigned delivery routes and status updating. | Viewing assigned waybills, progressing delivery milestones, submitting recipient acknowledgements. |

---

### 2.3 Operating Environment
* **Live Deployment Frontend:** Vercel Global Edge Network ([Live App](https://logistics-fleet-management-platform.vercel.app/login))
* **Production API Server:** Render / Railway PaaS (Node.js runtime environment)
* **Client Browsers:** Google Chrome &ge; 100, Mozilla Firefox &ge; 100, Microsoft Edge &ge; 100, Safari &ge; 15.
* **Database Platform:** MongoDB Atlas Cluster (M0/M10 Tier) / Embedded In-Memory Mongo Engine for evaluation.
* **Development Runtimes:** Node.js v20.x / v24.x, npm 11.x, Git 2.55+.

---

### 2.4 Design and Implementation Constraints
1. **Stateless Authentication:** Server sessions are stateless; authorization is validated on every request via cryptographic JWT verification.
2. **Password Security:** Plaintext passwords must never be stored. All credentials pass through a 10-round salted bcrypt hashing function before database write.
3. **Data Integrity:** Active vehicles and drivers engaged in `In Transit` or `Out for Delivery` shipments cannot be purged until the shipment is completed or reassigned.
4. **Deterministic Calculation:** Fuel costs must always equal `Litres × PricePerLitre` verified on backend submission.
5. **No AI Slop / Synthetic Gradients:** UI must follow standard enterprise logistics UX: clean slate/navy contrast, accessible table pagination, and responsive layouts.

---

## 3. System Features & Functional Requirements

### 3.1 Module 1: Authentication and Access Governance

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-1.1** | User Authentication | User logs in with corporate email and password. System validates credentials via bcrypt `compare` and issues a signed JWT token valid for 7 days. | High |
| **FR-1.2** | Role Authorization | Routes are protected by `authorize('admin', 'fleet_manager', 'driver')` middleware. Unauthorized roles receive HTTP 403 Forbidden. | High |
| **FR-1.3** | Session Persistence | Client saves JWT in `localStorage` and automatically injects it into all Axios requests via HTTP Bearer token interceptor. | High |
| **FR-1.4** | Quick Demo Authentication | Login screen includes one-click demo credentials for Admin, Fleet Manager, and Driver to facilitate rapid academic evaluation. | High |
| **FR-1.5** | User Provisioning | Administrator can provision new corporate user accounts specifying role and profile links. | Medium |

---

### 3.2 Module 2: Fleet Commercial Vehicle Management

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-2.1** | Vehicle Registration | Records Vehicle ID, Indian registration plate (`DL 01 AB 4921`), make, model, classification, capacity (kg), fuel type, and odometer reading. | High |
| **FR-2.2** | Compliance Expiry Tracking | Stores mandatory dates for Commercial Insurance expiry, PUC certificate renewal, and next scheduled service. | High |
| **FR-2.3** | Search & Multi-Filter | Supports case-insensitive regex search by plate/brand/model, filtering by status (`Available`, `In Transit`, `Maintenance`, `Inactive`), and pagination. | High |
| **FR-2.4** | Vehicle History Profile | View vehicle details linked with historical maintenance work orders, recent consignments, and fuel refill logs. | High |
| **FR-2.5** | Safe Vehicle Deletion | Prohibits deletion of vehicles currently assigned to active shipments (`In Transit`, `Picked Up`). | Medium |

---

### 3.3 Module 3: Commercial Driver Management

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-3.1** | Driver Onboarding | Captures Driver ID, name, mobile number, license number, license expiry date, heavy-vehicle experience (years), and emergency contact. | High |
| **FR-3.2** | Vehicle Allocation | Allows reciprocal vehicle-driver pairing: assigning a vehicle to a driver automatically updates the vehicle document's `assignedDriver` field. | High |
| **FR-3.3** | Driver Trip Statistics | Computes and displays total deliveries, active consignments, and historical trips fulfilled per driver. | Medium |
| **FR-3.4** | License Expiry Guard | Identifies drivers with licenses approaching expiry (< 30 days) and triggers critical alerts. | High |

---

### 3.4 Module 4: Consignment & Shipment Workflow

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-4.1** | Shipment Booking | Managers create shipments specifying customer details, pickup address, destination, cargo description, payload weight, priority, and target delivery date. | High |
| **FR-4.2** | Resource Allocation | Assigns dedicated vehicle and driver. Automatically shifts shipment status from `Pending` to `Assigned`. | High |
| **FR-4.3** | Visual Dispatch Timeline | Records each status milestone in an embedded sub-document array with status title, ISO timestamp, notes, and the operator's name. | High |
| **FR-4.4** | Priority Classification | Categorizes shipments into `Low`, `Standard`, `High`, and `Urgent` with color-coded visual indicators. | Medium |

---

### 3.5 Module 5: Dedicated Delivery Console & Backend State Synchronization

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-5.1** | Driver Console View | Filter shipments assigned exclusively to the authenticated driver. | High |
| **FR-5.2** | Milestone Progression | Driver updates status through operational progression (`Picked Up` &rarr; `In Transit` &rarr; `Out for Delivery` &rarr; `Delivered`). | High |
| **FR-5.3** | Automated State Sync | **Critical Requirement:** When delivery is marked `Delivered`: <br>1. Shipment `status` changes to `Delivered`. <br>2. `actualDeliveryDate` is recorded. <br>3. Assigned vehicle `status` automatically resets to `Available`. <br>4. Assigned driver `status` automatically resets to `Available`. | High |
| **FR-5.4** | Proof of Delivery (POD) | Mandatory capture of consignee recipient name (`recipientSignedBy`) upon delivery completion. | High |

---

### 3.6 Module 6: Route Corridors, Fuel & Maintenance

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-6.1** | Corridor Management | Manages designated highway corridors (e.g., Delhi-Jaipur, Mumbai-Pune) with checkpoints, distance, duration, and toll budget estimates. | Medium |
| **FR-6.2** | Fuel Cost Auto-Calculation | Pre-save hook computes `Total Cost = Litres × PricePerLitre`. Updates vehicle mileage if the odometer reading exceeds the existing value. | High |
| **FR-6.3** | Fuel Analytics | Computes fleet total fuel spend, total litres consumed, average price per litre, monthly trends, and vehicle-wise consumption breakdowns. | High |
| **FR-6.4** | Maintenance Logging | Tracks repair classifications (Engine, Brakes, Tires, Oil change), workshop name, invoice number, and service costs. | High |
| **FR-6.5** | Upcoming Service Alerts | Automatically flags vehicles whose scheduled service date is within 14 days or overdue. | High |

---

### 3.7 Module 7: Proactive Compliance & Reporting Engine

| Req ID | Requirement Title | Technical Specification & Validation Rule | Priority |
| :---: | :--- | :--- | :---: |
| **FR-7.1** | Automated Alert Engine | Scans the database every 30 minutes and generates notifications for insurance expiry, PUC due, license expiry, and service milestones. | High |
| **FR-7.2** | Notification Dropdown | Interactive topbar notification drawer displaying unread counter, category icons, read/unread states, and "Mark All Read" control. | High |
| **FR-7.3** | Executive KPI Dashboard | Real-time counts of Total Vehicles, Active Shipments, Maintenance Due, and Monthly Expenses. | High |
| **FR-7.4** | Dynamic CSV Exporter | Generates and triggers actual client-side `.csv` file downloads across Fleet, Delivery, Driver, Fuel, and Maintenance datasets. | High |

---

## 4. External Interface Requirements

### 4.1 User Interfaces (UI)
The frontend is built using standard responsive design patterns. The interface layout consists of:
* **Collapsible Enterprise Sidebar:** Navigation links for Dashboard, Deliveries, Vehicles, Drivers, Shipments, Routes, Fuel, Maintenance, and Reports. Displays the authenticated user's name and role badge with a Sign Out action.
* **Top Command Bar:** System operational telematics indicator, central hub indicator, and live notification drawer.
* **Data Presentation Tables:** Horizontally scrollable tables featuring status badges, monospace plate/ID typography, and action buttons.
* **Modal Forms:** Standard form modals for vehicle additions, driver onboarding, shipment bookings, maintenance records, and fuel logs.

---

### 4.2 Hardware Interfaces
The application runs on standard web architecture without requiring specialized client hardware:
* **Client Device:** Desktop, laptop, tablet, or smartphone (minimum screen width &ge; 360px).
* **RAM:** Minimum 2 GB available RAM on client machine.
* **Server Environment:** 512 MB – 1 GB RAM (Render / Railway Free/Starter Tier).

---

### 4.3 Software Interfaces

| Software Component | Technology Specification | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js 18.3 + Vite 6.1 | Single-Page Application (SPA) rendering and fast bundling. |
| **Routing** | React Router DOM v6.28 | Client-side declarative routing and protected routes. |
| **HTTP Client** | Axios 1.7.9 | REST API integration with token injection and error interception. |
| **Chart Engine** | Recharts 2.15 | SVG-based responsive analytics visualizations. |
| **Backend Framework** | Node.js v20+ / Express.js 4.21 | REST API endpoint routing and middleware execution. |
| **Database ODM** | Mongoose 8.9 / MongoDB 8.0 | Object Document Modeling, validation, and referencing. |
| **Security / Crypto** | bcryptjs 2.4.3 & jsonwebtoken 9.0 | 10-round password hashing and stateless token signing. |

---

### 4.4 Communication Interfaces
* **Client-Server Protocol:** HTTPS over TCP port 443 (Production) / HTTP over port 5000 (Local Development).
* **Data Format:** Standard `application/json` payload encoding.
* **Cross-Origin Resource Sharing (CORS):** Explicitly whitelisted origin headers for production domain (`https://logistics-fleet-management-platform.vercel.app`) and local development hosts (`http://localhost:5173`).

---

## 5. Non-Functional Requirements (NFRs)

| Metric / Attribute | Technical Target Specification | Verification Method |
| :--- | :--- | :--- |
| **Performance** | API response time &le; 200 ms for CRUD operations; initial SPA bundle load &le; 1.5 seconds over standard broadband. | Network profiling and benchmark scripts. |
| **Data Integrity & Consistency** | Immediate transactional consistency on vehicle-driver status resetting upon delivery completion. | Automated integration testing (`integrationTest.js`). |
| **Security & Privacy** | Passwords salted and hashed with bcrypt; JWT tokens signed with strong 256-bit secret; role-based access verified per route. | Security code review and vulnerability scanning. |
| **Reliability & Availability** | 99.5% uptime target on cloud PaaS; auto-restart on unhandled exceptions; embedded in-memory database fallback to avoid crashes. | Continuous uptime monitoring. |
| **Maintainability** | Clean separation of concerns (`/client` and `/server`), modular MVC architecture, standardized naming conventions. | Peer code inspection. |
| **Portability** | Cross-platform compatibility across Windows, Linux, macOS, and containerized Docker environments. | Multi-platform build validation. |
| **Usability** | Enterprise design system with restrained palette, accessible form labels, confirmation dialogs for destructive actions, and clear error notifications. | User evaluation and heuristics review. |

---

## 6. System Design and Analysis Models

### 6.1 System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|   React SPA (Vite) | React Router | Recharts Analytics | Enterprise UI System     |
+-----------------------------------------------------------------------------------+
                                         |
                                         | RESTful HTTPS API Requests (Bearer JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                                APPLICATION API LAYER                              |
|   Express.js Controllers | Auth & Role Middleware | Error Interceptors            |
|   - AuthController          - VehicleController          - DriverController       |
|   - ShipmentController      - DeliveryController         - FuelController         |
|   - MaintenanceController   - NotificationController     - ReportController       |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Mongoose ODM Methods
                                         v
+-----------------------------------------------------------------------------------+
|                                 DATA ACCESS LAYER                                 |
|   MongoDB Atlas (Production) / MongoMemoryServer (Development Fallback)           |
|   - Users      - Vehicles    - Drivers      - Shipments                           |
|   - FuelLogs   - WorkOrders  - RoutePlans   - Notifications                       |
+-----------------------------------------------------------------------------------+
```

---

### 6.2 Data Flow Diagram (DFD Level 0 - Context Level)

```
[ Customer / Dispatcher ] 
           |
           | 1. Consignment Booking Details
           v
+-------------------------------------------------------------------------+
|                                                                         |
|         0.0 COMPREHENSIVE LOGISTICS & FLEET MANAGEMENT PLATFORM          |
|                                                                         |
+-------------------------------------------------------------------------+
       ^                         ^                          ^
       | 2. Trip Updates         | 3. Fuel & Service Logs   | 4. System Audits
       v                         v                          v
[ Commercial Driver ]    [ Workshop / Fuel Station ]     [ Administrator ]
```

---

### 6.3 Data Flow Diagram (DFD Level 1 - Operational Breakdown)

```
[ User Credentials ] 
       |
       v
( 1.0 Authentication & Access Control ) ---> [ JWT Token Issued ]
       |
       +---> ( 2.0 Vehicle & Driver Registry ) <---> [ D1: Vehicles & Drivers Store ]
       |
       +---> ( 3.0 Consignment Dispatch Engine ) <---> [ D2: Shipments & Timelines Store ]
       |             |
       |             v (Handover / Milestone Update)
       +---> ( 4.0 Delivery State Sync Engine ) ---> [ Updates Status: Delivered ]
       |             |                        ---> [ Frees Vehicle & Driver: Available ]
       |             |
       +---> ( 5.0 Fuel & Maintenance Accounting ) <---> [ D3: Fuel & Workshop Logs ]
       |
       +---> ( 6.0 Compliance & Reporting Engine ) ---> [ Generates CSV Audits & KPI Charts ]
```

---

### 6.4 Core Workflow Sequence Diagram: Delivery Completion

```
Driver                     Client UI               DeliveryController          Database (MongoDB)
  |                            |                           |                          |
  |-- 1. Mark "Delivered" ---->|                           |                          |
  |   & Enter Recipient Name   |-- 2. PATCH /api/deliveries|                          |
  |                            |      /:id/update-status ->|                          |
  |                            |                           |-- 3. Verify Assignment ->|
  |                            |                           |<-- 4. Driver Confirmed --|
  |                            |                           |                          |
  |                            |                           |-- 5. Update Shipment --->|
  |                            |                           |      Status: Delivered   |
  |                            |                           |                          |
  |                            |                           |-- 6. Free Vehicle ------>|
  |                            |                           |      Status: Available   |
  |                            |                           |                          |
  |                            |                           |-- 7. Free Driver ------->|
  |                            |                           |      Status: Available   |
  |                            |                           |                          |
  |                            |                           |-- 8. Log Notification -->|
  |                            |                           |      Category: Delivery  |
  |                            |                           |                          |
  |                            |<-- 9. HTTP 200 OK --------|                          |
  |<-- 10. Success Banner -----|       State Synchronized  |                          |
```

---

### 6.5 Database Schema & Entity Relationships

```
+------------------+         +------------------+         +--------------------+
|     Vehicle      |         |     Driver       |         |      Shipment      |
+------------------+         +------------------+         +--------------------+
| _id (PK)         |         | _id (PK)         |         | _id (PK)           |
| vehicleId        |<---+    | driverId         |<---+    | shipmentId         |
| registrationNo   |    |    | name             |    |    | customerName       |
| vehicleType      |    |    | phone            |    |    | pickupAddress      |
| capacity         |    |    | licenseNumber    |    |    | deliveryAddress    |
| status           |    |    | licenseExpiry    |    |    | packageWeight      |
| insuranceExpiry  |    |    | assignedVehicle  |----+    | vehicle (FK)       |----> [Vehicle]
| pucExpiry        |    |    | status           |         | driver (FK)        |----> [Driver]
| nextServiceDate  |    |    +------------------+         | status             |
| assignedDriver   |----+                                 | timeline [SubDoc]  |
+------------------+                                      | recipientSignedBy  |
       ^                                                  +--------------------+
       |                                                             |
       +-------------------------------+                             |
       |                               |                             |
+--------------------+       +--------------------+                  |
|    Maintenance     |       |     FuelRecord     |                  |
+--------------------+       +--------------------+                  |
| _id (PK)           |       | _id (PK)           |                  |
| vehicle (FK)       |       | vehicle (FK)       |                  |
| serviceType        |       | driver (FK)        |                  |
| serviceDate        |       | litres             |                  |
| cost               |       | pricePerLitre      |                  |
| workshop           |       | totalCost          |                  |
| status             |       | odometerReading    |                  |
+--------------------+       +--------------------+                  |
                                                                     v
                                                          +--------------------+
                                                          |    Notification    |
                                                          +--------------------+
                                                          | _id (PK)           |
                                                          | title              |
                                                          | message            |
                                                          | category           |
                                                          | isRead             |
                                                          +--------------------+
```

---

## 7. Verification & Testing Evidence

The platform's functional and state-synchronization requirements were verified through the automated end-to-end integration test suite (`server/src/test/integrationTest.js`):

```
[Test] Starting comprehensive end-to-end integration test...
✓ [1/11] Health check: PASS (HTTP 200 OK)
✓ [2/11] Admin Login: PASS (JWT Token Issued)
✓ [3/11] Driver Login: PASS (Role-Restricted Scope)
✓ [4/11] Vehicles Fetch: PASS (11 Real Indian Fleet Vehicles)
✓ [5/11] Drivers Fetch: PASS (8 Commercial Heavy Drivers)
✓ [6/11] Shipments Fetch: PASS (16 Consignment Waybills)
✓ [7/11] Dashboard KPIs: PASS (11 Vehicles, 8 Drivers, 4 Active, 8 Delivered, ₹105,501 Fuel Spend)
✓ [8/11] Fuel Analytics: PASS (Cost & Mileage Computed)
✓ [9/11] Maintenance Upcoming Alerts: PASS (3 Approaching/Overdue Identified)
✓ [10/11] Fleet Notifications: PASS (6 Proactive Statutory Alerts)
✓ [11/11] Backend Delivery Workflow State Sync: PASS
         -> Consignment marked Delivered
         -> Vehicle DL 01 AB 4921 status automatically set to Available
         -> Driver Vikram Singh status automatically set to Available

================================================================================
ALL 11 INTEGRATION TESTS PASSED WITH 100% SUCCESS RATE
================================================================================
```

---

## 8. Academic Review & Sign-Off

This Software Requirements Specification document for the **Comprehensive Logistics and Fleet Management Platform** has been submitted, verified against the working production deployment, and approved by the academic advisory committee:

<br>

| **Student Candidate** | **Project Mentor** | **Internal Examiner** | **Head of Department (HOD)** |
| :---: | :---: | :---: | :---: |
| <br><br>____________________<br>**Anuk Choudhary**<br>Roll No: 2400321540043<br>Date: 29-Oct-2026 | <br><br>____________________<br>**Mr. Natesan Rajan**<br>Project Mentor<br>Date: 29-Oct-2026 | <br><br>____________________<br>**Internal Examiner**<br>Dept. of CSE, ABES EC<br>Date: ________________ | <br><br>____________________<br>**Head of Department**<br>Dept. of CSE, ABES EC<br>Date: ________________ |

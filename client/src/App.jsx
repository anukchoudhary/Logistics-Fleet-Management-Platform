import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Drivers from './pages/Drivers';
import DriverDetails from './pages/DriverDetails';
import Shipments from './pages/Shipments';
import ShipmentDetails from './pages/ShipmentDetails';
import Deliveries from './pages/Deliveries';
import RoutesPage from './pages/Routes';
import FuelPage from './pages/Fuel';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public authentication route */}
            <Route path="/login" element={<Login />} />

            {/* Protected enterprise application routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/:id" element={<DriverDetails />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="shipments/:id" element={<ShipmentDetails />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="fuel" element={<FuelPage />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

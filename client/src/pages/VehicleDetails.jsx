import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Truck,
  ArrowLeft,
  Calendar,
  Fuel,
  Wrench,
  Package,
  User,
  ShieldAlert,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatDate, formatCurrency, formatMileage } from '../utils/formatters';

const VehicleDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('maintenance');

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/vehicles/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicle details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error || !data?.vehicle) {
    return (
      <div>
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error || 'Vehicle not found.'}</div>
        </div>
        <Link to="/vehicles" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>
      </div>
    );
  }

  const { vehicle, maintenanceHistory = [], recentShipments = [], recentFuel = [] } = data;

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/vehicles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={14} /> Back to Vehicles Directory
        </Link>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-title">{vehicle.registrationNumber}</h1>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="page-subtitle">
              {vehicle.brand} {vehicle.model} &bull; {vehicle.vehicleType} &bull; ID: {vehicle.vehicleId}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Specifications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Technical Specifications</div>
            <Truck size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Manufacturer</div>
              <div style={{ fontWeight: 600 }}>{vehicle.brand}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Model & Year</div>
              <div style={{ fontWeight: 600 }}>{vehicle.model} ({vehicle.manufacturingYear})</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Payload Capacity</div>
              <div style={{ fontWeight: 600 }}>{Number(vehicle.capacity).toLocaleString('en-IN')} kg</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Fuel Type</div>
              <div style={{ fontWeight: 600 }}>{vehicle.fuelType}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Current Mileage</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatMileage(vehicle.currentMileage)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Classification</div>
              <div style={{ fontWeight: 600 }}>{vehicle.vehicleType}</div>
            </div>
          </div>
        </div>

        {/* Compliance & Maintenance Dates */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Compliance & Service Schedule</div>
            <Calendar size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Insurance Expiry</div>
              <div style={{ fontWeight: 600 }}>{formatDate(vehicle.insuranceExpiry)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>PUC Expiry</div>
              <div style={{ fontWeight: 600 }}>{formatDate(vehicle.pucExpiry)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Last Service Date</div>
              <div style={{ fontWeight: 600 }}>{formatDate(vehicle.lastServiceDate)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Next Service Due</div>
              <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatDate(vehicle.nextServiceDate)}</div>
            </div>
          </div>
        </div>

        {/* Driver Assigned */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Assigned Commercial Driver</div>
            <User size={16} color="var(--primary)" />
          </div>
          {vehicle.assignedDriver ? (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                {vehicle.assignedDriver.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Phone: <strong>{vehicle.assignedDriver.phone}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Commercial License: <strong>{vehicle.assignedDriver.licenseNumber}</strong>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Link to={`/drivers/${vehicle.assignedDriver._id}`} className="btn btn-secondary btn-sm">
                  View Driver Profile
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No commercial driver currently allocated to this vehicle.
            </div>
          )}
        </div>
      </div>

      {/* History Tabs */}
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: '#f8fafc',
            borderTopLeftRadius: 'var(--radius-md)',
            borderTopRightRadius: 'var(--radius-md)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'maintenance' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'maintenance' ? '2px solid var(--primary)' : '2px solid transparent',
              background: activeTab === 'maintenance' ? '#ffffff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Wrench size={16} />
            <span>Maintenance History ({maintenanceHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipments')}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'shipments' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'shipments' ? '2px solid var(--primary)' : '2px solid transparent',
              background: activeTab === 'shipments' ? '#ffffff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={16} />
            <span>Shipment Records ({recentShipments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fuel')}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'fuel' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'fuel' ? '2px solid var(--primary)' : '2px solid transparent',
              background: activeTab === 'fuel' ? '#ffffff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Fuel size={16} />
            <span>Fuel Refill Logs ({recentFuel.length})</span>
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Maintenance tab */}
          {activeTab === 'maintenance' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Service Type</th>
                    <th>Workshop</th>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Next Due</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No maintenance logs recorded for this vehicle.
                      </td>
                    </tr>
                  ) : (
                    maintenanceHistory.map((m) => (
                      <tr key={m._id}>
                        <td>{formatDate(m.serviceDate)}</td>
                        <td style={{ fontWeight: 600 }}>{m.serviceType}</td>
                        <td>{m.workshop}</td>
                        <td style={{ maxWidth: '280px', fontSize: '12px' }}>{m.description}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(m.cost)}</td>
                        <td>
                          <StatusBadge status={m.status} />
                        </td>
                        <td>{formatDate(m.nextServiceDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Shipments tab */}
          {activeTab === 'shipments' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Client / Destination</th>
                    <th>Payload Weight</th>
                    <th>Driver</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentShipments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No shipments assigned to this vehicle yet.
                      </td>
                    </tr>
                  ) : (
                    recentShipments.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <Link to={`/shipments/${s._id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                            #{s.shipmentId}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{s.customerName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.deliveryAddress}</div>
                        </td>
                        <td>{s.packageWeight} kg</td>
                        <td>{s.driver?.name || 'Unassigned'}</td>
                        <td>{s.priority}</td>
                        <td>
                          <StatusBadge status={s.status} />
                        </td>
                        <td>{formatDate(s.createdDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Fuel tab */}
          {activeTab === 'fuel' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Station / Vendor</th>
                    <th>Fuel Type</th>
                    <th>Litres</th>
                    <th>Price/Litre</th>
                    <th>Total Expense</th>
                    <th>Odometer Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFuel.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No fuel logs recorded for this vehicle.
                      </td>
                    </tr>
                  ) : (
                    recentFuel.map((f) => (
                      <tr key={f._id}>
                        <td>{formatDate(f.date)}</td>
                        <td style={{ fontWeight: 500 }}>{f.fuelStation}</td>
                        <td>{f.fuelType}</td>
                        <td>{f.litres} L</td>
                        <td>₹{f.pricePerLitre}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(f.totalCost)}</td>
                        <td style={{ fontFamily: 'monospace' }}>{formatMileage(f.odometerReading)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

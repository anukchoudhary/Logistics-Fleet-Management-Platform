import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  ArrowLeft,
  Truck,
  Phone,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const DriverDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/drivers/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load driver details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error || !data?.driver) {
    return (
      <div>
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error || 'Driver profile not found.'}</div>
        </div>
        <Link to="/drivers" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Drivers
        </Link>
      </div>
    );
  }

  const { driver, deliveries = [], stats = {} } = data;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/drivers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={14} /> Back to Drivers Directory
        </Link>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-title">{driver.name}</h1>
              <StatusBadge status={driver.status} />
            </div>
            <p className="page-subtitle">
              Driver ID: {driver.driverId} &bull; Commercial License: {driver.licenseNumber}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Assigned Consignments</div>
            <div className="stat-value">{stats.totalDeliveries || deliveries.length}</div>
          </div>
          <div className="stat-icon" style={{ color: 'var(--primary)' }}>
            <Package size={22} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Successful Deliveries</div>
            <div className="stat-value">{stats.completedDeliveries || 0}</div>
          </div>
          <div className="stat-icon" style={{ color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Active / In Transit</div>
            <div className="stat-value">{stats.activeDeliveries || 0}</div>
          </div>
          <div className="stat-icon" style={{ color: 'var(--info)' }}>
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Driver Details & Assigned Truck */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Commercial Driver Profile</div>
            <Users size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Phone Contact</div>
              <div style={{ fontWeight: 600 }}>{driver.phone}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontWeight: 600 }}>{driver.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Commercial License</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{driver.licenseNumber}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>License Expiry Date</div>
              <div style={{ fontWeight: 600 }}>{formatDate(driver.licenseExpiry)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Heavy Vehicle Experience</div>
              <div style={{ fontWeight: 600 }}>{driver.experience} Years</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Joining Date</div>
              <div style={{ fontWeight: 600 }}>{formatDate(driver.joiningDate)}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Emergency Contact</div>
              <div style={{ fontWeight: 600 }}>{driver.emergencyContact || 'Not recorded'}</div>
            </div>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Dedicated Truck / Commercial Vehicle</div>
            <Truck size={16} color="var(--primary)" />
          </div>
          {driver.assignedVehicle ? (
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                {driver.assignedVehicle.registrationNumber}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {driver.assignedVehicle.brand} {driver.assignedVehicle.model} ({driver.assignedVehicle.vehicleType})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Payload: <strong>{Number(driver.assignedVehicle.capacity || 0).toLocaleString('en-IN')} kg</strong> &bull; Status: <StatusBadge status={driver.assignedVehicle.status} />
              </div>
              <Link to={`/vehicles/${driver.assignedVehicle._id}`} className="btn btn-secondary btn-sm">
                View Vehicle Specs
              </Link>
            </div>
          ) : (
            <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              No commercial vehicle currently allocated to this driver.
            </div>
          )}
        </div>
      </div>

      {/* Delivery History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Consignment Delivery History</div>
          <Package size={16} color="var(--primary)" />
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Client</th>
                <th>Destination Address</th>
                <th>Vehicle</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Booking Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No delivery records logged for this driver.
                  </td>
                </tr>
              ) : (
                deliveries.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/shipments/${s._id}`} style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        #{s.shipmentId}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.customerName}</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.deliveryAddress}
                    </td>
                    <td>{s.vehicle?.registrationNumber || 'Unassigned'}</td>
                    <td>{s.priority}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>{formatDate(s.createdDate)}</td>
                    <td>
                      <Link to={`/shipments/${s._id}`} className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;

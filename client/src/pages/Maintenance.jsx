import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Wrench,
  Plus,
  AlertTriangle,
  Calendar,
  Truck,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const SERVICE_TYPES = [
  'Scheduled Service',
  'Engine Overhaul',
  'Brake Replacement',
  'Tire Replacement',
  'Oil & Filter Change',
  'Electrical Repair',
  'Suspension Work',
  'Emergency Breakdown',
];

const MAINTENANCE_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const Maintenance = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [records, setRecords] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    vehicle: '',
    serviceType: 'Scheduled Service',
    serviceDate: new Date().toISOString().slice(0, 10),
    description: '',
    cost: 15000,
    workshop: '',
    nextServiceDate: '',
    status: 'Scheduled',
    odometerAtService: 0,
    invoiceNumber: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchMaintenanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [recordsRes, alertsRes] = await Promise.all([
        api.get('/maintenance?limit=50'),
        api.get('/maintenance/upcoming/alerts'),
      ]);
      setRecords(recordsRes.data.records || []);
      setUpcomingServices(alertsRes.data.upcoming || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehiclesList = async () => {
    try {
      const res = await api.get('/vehicles?limit=100');
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.warn('Could not load vehicles for maintenance:', err.message);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
    if (canManage) {
      fetchVehiclesList();
    }
  }, [fetchMaintenanceData, canManage]);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      vehicle: rec.vehicle?._id || rec.vehicle || '',
      serviceType: rec.serviceType,
      serviceDate: rec.serviceDate ? rec.serviceDate.slice(0, 10) : '',
      description: rec.description,
      cost: rec.cost,
      workshop: rec.workshop,
      nextServiceDate: rec.nextServiceDate ? rec.nextServiceDate.slice(0, 10) : '',
      status: rec.status,
      odometerAtService: rec.odometerAtService || 0,
      invoiceNumber: rec.invoiceNumber || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (rec) => {
    setSelectedRecord(rec);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      await api.post('/maintenance', formData);
      setIsAddModalOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record maintenance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      await api.put(`/maintenance/${selectedRecord._id}`, formData);
      setIsEditModalOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/maintenance/${selectedRecord._id}`);
      setIsDeleteModalOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Maintenance & Workshop Services</h1>
          <p className="page-subtitle">
            Preventative maintenance scheduling, workshop repairs, expense auditing, and service alerts
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Schedule Maintenance</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Upcoming Service Inspection Alerts Banner */}
      {upcomingServices.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <AlertTriangle size={20} color="#b45309" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
              Action Required: Approaching Periodic Service Inspections ({upcomingServices.length} Vehicles)
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#78350f', marginBottom: '12px' }}>
            The following vehicles have scheduled service dates within the next 14 days or are overdue. Please coordinate workshop bay bookings.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {upcomingServices.map((v) => {
              const isOverdue = new Date(v.nextServiceDate) < new Date();
              return (
                <div
                  key={v._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fef08a',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{v.registrationNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {v.brand} {v.model} &bull; Odometer: {v.currentMileage?.toLocaleString('en-IN')} km
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                      {isOverdue ? 'Overdue' : 'Due Soon'}
                    </span>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                      {formatDate(v.nextServiceDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Maintenance Records Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Commercial Maintenance History & Active Work Orders</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {records.length} records logged
          </span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Date</th>
                <th>Vehicle</th>
                <th>Service Classification</th>
                <th>Authorized Workshop</th>
                <th>Diagnostic / Service Notes</th>
                <th>Cost (₹)</th>
                <th>Odometer</th>
                <th>Next Service Due</th>
                <th>Status</th>
                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No maintenance records logged.
                  </td>
                </tr>
              ) : (
                records.map((m) => (
                  <tr key={m._id}>
                    <td>{formatDate(m.serviceDate)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {m.vehicle?.registrationNumber || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {m.vehicle?.brand} {m.vehicle?.model}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.serviceType}</td>
                    <td style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.workshop}
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {m.description}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(m.cost)}</td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {m.odometerAtService ? `${m.odometerAtService.toLocaleString('en-IN')} km` : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}>{formatDate(m.nextServiceDate)}</span>
                    </td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                    {canManage && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(m)}
                          >
                            <Edit2 size={13} />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenDelete(m)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Maintenance Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Record Fleet Maintenance' : 'Edit Maintenance Work Order'}
        maxWidth="660px"
      >
        {formError && (
          <div className="alert-box alert-danger">
            <AlertTriangle size={18} />
            <div>{formError}</div>
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vehicle *</label>
              <select
                name="vehicle"
                className="form-control"
                value={formData.vehicle}
                onChange={handleFormChange}
                required
              >
                <option value="">-- Select Commercial Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} ({v.brand} {v.model})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Service Classification *</label>
              <select
                name="serviceType"
                className="form-control"
                value={formData.serviceType}
                onChange={handleFormChange}
                required
              >
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Date *</label>
              <input
                type="date"
                name="serviceDate"
                className="form-control"
                value={formData.serviceDate}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Service Target Date *</label>
              <input
                type="date"
                name="nextServiceDate"
                className="form-control"
                value={formData.nextServiceDate}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Cost (in ₹) *</label>
              <input
                type="number"
                name="cost"
                className="form-control"
                min="0"
                value={formData.cost}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleFormChange}
              >
                {MAINTENANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Authorized Workshop & Location *</label>
            <input
              type="text"
              name="workshop"
              className="form-control"
              placeholder="e.g. Tata Motors Commercial Hub, Sector 18 Gurgaon"
              value={formData.workshop}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Work Description *</label>
            <textarea
              name="description"
              className="form-control"
              rows={3}
              placeholder="e.g. Engine oil replacement, fuel filter change, brake drum inspection, grease packing"
              value={formData.description}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Odometer at Service (km)</label>
              <input
                type="number"
                name="odometerAtService"
                className="form-control"
                value={formData.odometerAtService}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                className="form-control"
                placeholder="e.g. TM-GGN-2026-902"
                value={formData.invoiceNumber}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isAddModalOpen ? 'Record Maintenance' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Record Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Maintenance Record"
        message="Are you sure you want to delete this maintenance record?"
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default Maintenance;

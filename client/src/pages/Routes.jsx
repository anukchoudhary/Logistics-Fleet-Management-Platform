import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  MapPin,
  Plus,
  Truck,
  User,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Routes = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    routeCode: '',
    title: '',
    originCity: '',
    destinationCity: '',
    distanceKm: 250,
    estimatedDurationHours: 5,
    assignedVehicle: '',
    assignedDriver: '',
    currentStatus: 'Scheduled',
    tollExpensesEstimated: 500,
    waypointStr: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/routes');
      setRoutes(res.data.routes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transport routes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFleetResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get('/vehicles?limit=100'),
        api.get('/drivers?limit=100'),
      ]);
      setVehicles(vRes.data.vehicles || []);
      setDrivers(dRes.data.drivers || []);
    } catch (err) {
      console.warn('Could not load vehicle/driver dropdowns:', err.message);
    }
  };

  useEffect(() => {
    fetchRoutes();
    if (canManage) {
      fetchFleetResources();
    }
  }, [canManage]);

  const handleOpenAdd = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      ...initialFormState,
      routeCode: `RT-COR-${randomSuffix}`,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setSelectedRoute(r);
    setFormData({
      routeCode: r.routeCode,
      title: r.title,
      originCity: r.originCity,
      destinationCity: r.destinationCity,
      distanceKm: r.distanceKm,
      estimatedDurationHours: r.estimatedDurationHours,
      assignedVehicle: r.assignedVehicle?._id || r.assignedVehicle || '',
      assignedDriver: r.assignedDriver?._id || r.assignedDriver || '',
      currentStatus: r.currentStatus,
      tollExpensesEstimated: r.tollExpensesEstimated || 0,
      waypointStr: (r.waypoints || []).map((w) => w.name).join(', '),
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (r) => {
    setSelectedRoute(r);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseWaypoints = (str) => {
    if (!str) return [];
    return str
      .split(',')
      .map((item, idx) => ({
        name: item.trim(),
        order: idx + 1,
        isCompleted: false,
      }))
      .filter((w) => w.name.length > 0);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      const waypoints = parseWaypoints(formData.waypointStr);
      await api.post('/routes', { ...formData, waypoints });
      setIsAddModalOpen(false);
      fetchRoutes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create route plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      const waypoints = parseWaypoints(formData.waypointStr);
      await api.put(`/routes/${selectedRoute._id}`, { ...formData, waypoints });
      setIsEditModalOpen(false);
      fetchRoutes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update route.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/routes/${selectedRoute._id}`);
      setIsDeleteModalOpen(false);
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete route.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Corridor & Route Network Management</h1>
          <p className="page-subtitle">
            Defined logistics highways, estimated transit durations, checkpoints, and toll budgeting
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Define Route</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner" />
        </div>
      ) : routes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          No transport routes configured.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          {routes.map((r) => (
            <div key={r._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {r.routeCode}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {r.title}
                    </h3>
                  </div>
                  <StatusBadge status={r.currentStatus} />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    background: 'var(--bg-subtle)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Origin:</span>
                    <div style={{ fontWeight: 600 }}>{r.originCity}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                    <div style={{ fontWeight: 600 }}>{r.destinationCity}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Distance:</span>
                    <div style={{ fontWeight: 600 }}>{r.distanceKm} km</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Est. Transit Time:</span>
                    <div style={{ fontWeight: 600 }}>{r.estimatedDurationHours} Hours</div>
                  </div>
                </div>

                {/* Assigned Vehicle & Driver */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <div>
                    Vehicle: <strong>{r.assignedVehicle?.registrationNumber || 'Unassigned'}</strong>
                  </div>
                  <div>
                    Driver: <strong>{r.assignedDriver?.name || 'Unassigned'}</strong>
                  </div>
                  <div>
                    Est. Toll: <strong>{formatCurrency(r.tollExpensesEstimated)}</strong>
                  </div>
                </div>

                {/* Checkpoints / Waypoints Visualization */}
                {r.waypoints && r.waypoints.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Corridor Checkpoints & Land Tolls
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {r.waypoints.map((wp, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            background: wp.isCompleted ? 'var(--success-bg)' : '#ffffff',
                            color: wp.isCompleted ? 'var(--success)' : 'var(--text-main)',
                            border: `1px solid ${wp.isCompleted ? 'var(--success-border)' : 'var(--border-color)'}`,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{idx + 1}.</span> {wp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canManage && (
                <div
                  style={{
                    paddingTop: '14px',
                    marginTop: '14px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(r)}
                  >
                    <Edit2 size={13} />
                    <span>Edit Route</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleOpenDelete(r)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Route Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Define Logistics Transport Route' : `Edit Route: ${formData.routeCode}`}
        maxWidth="640px"
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
              <label className="form-label">Route Code *</label>
              <input
                type="text"
                name="routeCode"
                className="form-control"
                value={formData.routeCode}
                onChange={handleFormChange}
                required
                disabled={isEditModalOpen}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Route Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Delhi NCR - Jaipur Expressway Express"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origin City / Hub *</label>
              <input
                type="text"
                name="originCity"
                className="form-control"
                placeholder="e.g. Gurgaon, Haryana"
                value={formData.originCity}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination City / Hub *</label>
              <input
                type="text"
                name="destinationCity"
                className="form-control"
                placeholder="e.g. Sitapura, Jaipur"
                value={formData.destinationCity}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Distance (in km) *</label>
              <input
                type="number"
                name="distanceKm"
                className="form-control"
                min="1"
                value={formData.distanceKm}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Transit (Hours) *</label>
              <input
                type="number"
                step="0.5"
                name="estimatedDurationHours"
                className="form-control"
                min="0.5"
                value={formData.estimatedDurationHours}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned Vehicle</label>
              <select
                name="assignedVehicle"
                className="form-control"
                value={formData.assignedVehicle}
                onChange={handleFormChange}
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} ({v.brand} {v.model})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Driver</label>
              <select
                name="assignedDriver"
                className="form-control"
                value={formData.assignedDriver}
                onChange={handleFormChange}
              >
                <option value="">-- No Driver Assigned --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.driverId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estimated Toll Expenses (₹)</label>
              <input
                type="number"
                name="tollExpensesEstimated"
                className="form-control"
                min="0"
                value={formData.tollExpensesEstimated}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select
                name="currentStatus"
                className="form-control"
                value={formData.currentStatus}
                onChange={handleFormChange}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Waypoints & Checkpoints (Comma-separated)</label>
            <input
              type="text"
              name="waypointStr"
              className="form-control"
              placeholder="e.g. Manesar Hub, Dharuhera Toll Plaza, Shahpura Junction, Sitapura Gate"
              value={formData.waypointStr}
              onChange={handleFormChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Create Route Plan' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Route Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Route Plan"
        message={`Are you sure you want to delete route ${selectedRoute?.title} (${selectedRoute?.routeCode})?`}
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default Routes;

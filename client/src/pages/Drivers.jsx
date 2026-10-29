import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Truck,
  Phone,
  Shield,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Drivers = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    driverId: '',
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: 5,
    assignedVehicle: '',
    status: 'Available',
    emergencyContact: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await api.get(`/drivers?${params.toString()}`);
      setDrivers(res.data.drivers || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchVehiclesList = async () => {
    try {
      const res = await api.get('/vehicles?limit=100');
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.warn('Could not load vehicles for driver dropdown:', err.message);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    if (canManage) {
      fetchVehiclesList();
    }
  }, [canManage]);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setSelectedDriver(d);
    setFormData({
      driverId: d.driverId,
      name: d.name,
      phone: d.phone,
      email: d.email || '',
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.slice(0, 10) : '',
      experience: d.experience,
      assignedVehicle: d.assignedVehicle?._id || d.assignedVehicle || '',
      status: d.status,
      emergencyContact: d.emergencyContact || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (d) => {
    setSelectedDriver(d);
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
      await api.post('/drivers', formData);
      setIsAddModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to onboard driver.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      await api.put(`/drivers/${selectedDriver._id}`, formData);
      setIsEditModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update driver details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/drivers/${selectedDriver._id}`);
      setIsDeleteModalOpen(false);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete driver.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Commercial Drivers Directory</h1>
          <p className="page-subtitle">
            Manage heavy vehicle licensed drivers, assigned trucks, compliance, and experience ({totalCount} drivers)
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Onboard Driver</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Driver Name, ID (DRV-101), Phone, License..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {(search || statusFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Drivers Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver ID</th>
              <th>Full Name</th>
              <th>Contact Phone</th>
              <th>Commercial License</th>
              <th>License Expiry</th>
              <th>Experience</th>
              <th>Assigned Vehicle</th>
              <th>Status</th>
              <th>Joining Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px' }}>
                  <div className="spinner" />
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No commercial drivers found matching criteria.
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d._id}>
                  <td>
                    <Link
                      to={`/drivers/${d._id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}
                    >
                      {d.driverId}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    {d.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.email}</div>}
                  </td>
                  <td>{d.phone}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                      {d.licenseNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>{formatDate(d.licenseExpiry)}</span>
                  </td>
                  <td>{d.experience} yrs</td>
                  <td>
                    {d.assignedVehicle ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.assignedVehicle.registrationNumber}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {d.assignedVehicle.brand} {d.assignedVehicle.model}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td>{formatDate(d.joiningDate)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        to={`/drivers/${d._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Driver History"
                      >
                        <Eye size={14} />
                      </Link>
                      {canManage && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(d)}
                          title="Edit Driver Details"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(d)}
                          title="Delete Driver"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Page {page} of {totalPages} ({totalCount} drivers)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Onboard Commercial Driver' : `Edit Driver: ${formData.name}`}
        maxWidth="620px"
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
              <label className="form-label">Driver ID *</label>
              <input
                type="text"
                name="driverId"
                className="form-control"
                placeholder="e.g. DRV-109"
                value={formData.driverId}
                onChange={handleFormChange}
                required
                disabled={isEditModalOpen}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Rajesh Kumar"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+91 98112 00000"
                value={formData.phone}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="driver@logistics.hcl.internal"
                value={formData.email}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Commercial License Number *</label>
              <input
                type="text"
                name="licenseNumber"
                className="form-control"
                placeholder="e.g. DL-0420180029102"
                value={formData.licenseNumber}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">License Expiry Date *</label>
              <input
                type="date"
                name="licenseExpiry"
                className="form-control"
                value={formData.licenseExpiry}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Driving Experience (in years) *</label>
              <input
                type="number"
                name="experience"
                className="form-control"
                min="0"
                value={formData.experience}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operational Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign Vehicle</label>
              <select
                name="assignedVehicle"
                className="form-control"
                value={formData.assignedVehicle}
                onChange={handleFormChange}
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} ({v.brand} {v.model} - {v.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact Info</label>
              <input
                type="text"
                name="emergencyContact"
                className="form-control"
                placeholder="+91 98112 00001 (Spouse / Relative)"
                value={formData.emergencyContact}
                onChange={handleFormChange}
              />
            </div>
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Onboard Driver' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Driver Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver Profile"
        message={`Are you sure you want to permanently remove driver profile for ${selectedDriver?.name} (${selectedDriver?.driverId})?`}
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default Drivers;

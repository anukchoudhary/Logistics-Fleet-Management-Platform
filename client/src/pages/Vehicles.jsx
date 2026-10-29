import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  Fuel,
} from 'lucide-react';
import { formatDate, formatMileage } from '../utils/formatters';

const VEHICLE_TYPES = [
  'Heavy Commercial (HCV)',
  'Medium Commercial (MCV)',
  'Light Commercial (LCV)',
  'Cargo Trailer',
  'Refrigerated Carrier',
];

const FUEL_TYPES = ['Diesel', 'CNG', 'Electric', 'Petrol'];

const Vehicles = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const initialFormState = {
    vehicleId: '',
    registrationNumber: '',
    vehicleType: 'Medium Commercial (MCV)',
    brand: '',
    model: '',
    manufacturingYear: new Date().getFullYear(),
    capacity: 10000,
    fuelType: 'Diesel',
    currentMileage: 0,
    status: 'Available',
    insuranceExpiry: '',
    pucExpiry: '',
    nextServiceDate: '',
    assignedDriver: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { vehicleType: typeFilter }),
      });
      const res = await api.get(`/vehicles?${params.toString()}`);
      setVehicles(res.data.vehicles || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles list.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  const fetchDriversList = async () => {
    try {
      const res = await api.get('/drivers?limit=100');
      setDrivers(res.data.drivers || []);
    } catch (err) {
      console.warn('Could not load drivers for dropdown:', err.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (canManage) {
      fetchDriversList();
    }
  }, [canManage]);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setSelectedVehicle(v);
    setFormData({
      vehicleId: v.vehicleId,
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      brand: v.brand,
      model: v.model,
      manufacturingYear: v.manufacturingYear,
      capacity: v.capacity,
      fuelType: v.fuelType,
      currentMileage: v.currentMileage,
      status: v.status,
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.slice(0, 10) : '',
      pucExpiry: v.pucExpiry ? v.pucExpiry.slice(0, 10) : '',
      nextServiceDate: v.nextServiceDate ? v.nextServiceDate.slice(0, 10) : '',
      assignedDriver: v.assignedDriver?._id || v.assignedDriver || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (v) => {
    setSelectedVehicle(v);
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
      await api.post('/vehicles', formData);
      setIsAddModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      await api.put(`/vehicles/${selectedVehicle._id}`, formData);
      setIsEditModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/vehicles/${selectedVehicle._id}`);
      setIsDeleteModalOpen(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Vehicles Management</h1>
          <p className="page-subtitle">
            Manage registrations, payload capacities, compliance dates, and driver allocations ({totalCount} total)
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Vehicle</span>
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
              placeholder="Search by Plate (DL 01...), ID (VEH-101), Brand, Model..."
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
              <option value="In Transit">In Transit</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Vehicle Types</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter || typeFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setTypeFilter('');
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Registration No.</th>
              <th>Make & Model</th>
              <th>Classification</th>
              <th>Payload</th>
              <th>Fuel</th>
              <th>Odometer</th>
              <th>Status</th>
              <th>Assigned Driver</th>
              <th>Next Service</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px' }}>
                  <div className="spinner" />
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No fleet vehicles matching the current filters.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <Link
                      to={`/vehicles/${v._id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}
                    >
                      {v.vehicleId}
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                      {v.registrationNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.brand}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {v.model} ({v.manufacturingYear})
                    </div>
                  </td>
                  <td style={{ fontSize: '12px' }}>{v.vehicleType}</td>
                  <td>{Number(v.capacity).toLocaleString('en-IN')} kg</td>
                  <td>
                    <span className="badge badge-neutral">{v.fuelType}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{formatMileage(v.currentMileage)}</td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td>
                    {v.assignedDriver ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{v.assignedDriver.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {v.assignedDriver.phone}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>{formatDate(v.nextServiceDate)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        to={`/vehicles/${v._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Full History"
                      >
                        <Eye size={14} />
                      </Link>
                      {canManage && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(v)}
                          title="Edit Vehicle Details"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(v)}
                          title="Delete Vehicle"
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
            Page {page} of {totalPages} ({totalCount} vehicles)
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

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add Fleet Commercial Vehicle' : `Edit Vehicle: ${formData.registrationNumber}`}
        maxWidth="680px"
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
              <label className="form-label">Vehicle ID *</label>
              <input
                type="text"
                name="vehicleId"
                className="form-control"
                placeholder="e.g. VEH-112"
                value={formData.vehicleId}
                onChange={handleFormChange}
                required
                disabled={isEditModalOpen}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Plate No. *</label>
              <input
                type="text"
                name="registrationNumber"
                className="form-control"
                placeholder="e.g. DL 01 AB 4921"
                value={formData.registrationNumber}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand / Manufacturer *</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                placeholder="e.g. Tata Motors, Ashok Leyland"
                value={formData.brand}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model Name *</label>
              <input
                type="text"
                name="model"
                className="form-control"
                placeholder="e.g. Signa 4825.TK"
                value={formData.model}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vehicle Classification</label>
              <select
                name="vehicleType"
                className="form-control"
                value={formData.vehicleType}
                onChange={handleFormChange}
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturing Year *</label>
              <input
                type="number"
                name="manufacturingYear"
                className="form-control"
                min="1995"
                max={new Date().getFullYear() + 1}
                value={formData.manufacturingYear}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payload Capacity (in kg) *</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                min="100"
                value={formData.capacity}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                name="fuelType"
                className="form-control"
                value={formData.fuelType}
                onChange={handleFormChange}
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Current Odometer (km)</label>
              <input
                type="number"
                name="currentMileage"
                className="form-control"
                min="0"
                value={formData.currentMileage}
                onChange={handleFormChange}
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
                <option value="In Transit">In Transit</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Insurance Expiry Date *</label>
              <input
                type="date"
                name="insuranceExpiry"
                className="form-control"
                value={formData.insuranceExpiry}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">PUC Expiry Date *</label>
              <input
                type="date"
                name="pucExpiry"
                className="form-control"
                value={formData.pucExpiry}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Next Scheduled Service *</label>
              <input
                type="date"
                name="nextServiceDate"
                className="form-control"
                value={formData.nextServiceDate}
                onChange={handleFormChange}
                required
              />
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
                    {d.name} ({d.driverId} - {d.status})
                  </option>
                ))}
              </select>
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Create Vehicle Record' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Fleet Vehicle"
        message={`Are you sure you want to permanently delete vehicle ${selectedVehicle?.registrationNumber} (${selectedVehicle?.brand} ${selectedVehicle?.model})?`}
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default Vehicles;

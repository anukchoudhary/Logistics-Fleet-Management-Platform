import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Truck,
  User,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const SHIPMENT_STATUSES = [
  'Pending',
  'Assigned',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const PRIORITIES = ['Low', 'Standard', 'High', 'Urgent'];

const Shipments = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    shipmentId: '',
    customerName: '',
    customerPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    packageWeight: 1000,
    vehicle: '',
    driver: '',
    priority: 'Standard',
    expectedDeliveryDate: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      });
      const res = await api.get(`/shipments?${params.toString()}`);
      setShipments(res.data.shipments || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipments list.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter]);

  const fetchFleetResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get('/vehicles?limit=100'),
        api.get('/drivers?limit=100'),
      ]);
      setVehicles(vRes.data.vehicles || []);
      setDrivers(dRes.data.drivers || []);
    } catch (err) {
      console.warn('Could not load vehicle/driver dropdown options:', err.message);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    if (canManage) {
      fetchFleetResources();
    }
  }, [canManage]);

  const handleOpenAdd = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      ...initialFormState,
      shipmentId: `SHP-${randomSuffix}`,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedShipment(s);
    setFormData({
      shipmentId: s.shipmentId,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      pickupAddress: s.pickupAddress,
      deliveryAddress: s.deliveryAddress,
      packageDescription: s.packageDescription,
      packageWeight: s.packageWeight,
      vehicle: s.vehicle?._id || s.vehicle || '',
      driver: s.driver?._id || s.driver || '',
      priority: s.priority,
      status: s.status,
      expectedDeliveryDate: s.expectedDeliveryDate ? s.expectedDeliveryDate.slice(0, 10) : '',
      deliveryNotes: s.deliveryNotes || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (s) => {
    setSelectedShipment(s);
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
      await api.post('/shipments', formData);
      setIsAddModalOpen(false);
      fetchShipments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      await api.put(`/shipments/${selectedShipment._id}`, formData);
      setIsEditModalOpen(false);
      fetchShipments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/shipments/${selectedShipment._id}`);
      setIsDeleteModalOpen(false);
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Consignments & Shipment Dispatch</h1>
          <p className="page-subtitle">
            Manage cargo bookings, vehicle/driver assignment, route schedules, and proof of delivery ({totalCount} shipments)
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Book New Shipment</span>
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
              placeholder="Search by Shipment ID (SHP-9021), Customer, Pickup, Destination..."
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
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-control"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter || priorityFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Customer / Client</th>
              <th>Origin & Destination</th>
              <th>Cargo Weight</th>
              <th>Vehicle Allocation</th>
              <th>Driver</th>
              <th>Priority</th>
              <th>Target Date</th>
              <th>Status</th>
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
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No shipments found matching filters.
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s._id}>
                  <td>
                    <Link
                      to={`/shipments/${s._id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}
                    >
                      #{s.shipmentId}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.customerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.customerPhone}</div>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>From:</strong> {s.pickupAddress}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>To:</strong> {s.deliveryAddress}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{Number(s.packageWeight).toLocaleString('en-IN')} kg</span>
                  </td>
                  <td>
                    {s.vehicle ? (
                      <span style={{ fontWeight: 600 }}>{s.vehicle.registrationNumber}</span>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Pending Allocation</span>
                    )}
                  </td>
                  <td>{s.driver?.name || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.priority === 'Urgent'
                          ? 'badge-danger'
                          : s.priority === 'High'
                          ? 'badge-warning'
                          : 'badge-neutral'
                      }`}
                    >
                      {s.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>{formatDate(s.expectedDeliveryDate)}</span>
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        to={`/shipments/${s._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Full Shipment Timeline"
                      >
                        <Eye size={14} />
                      </Link>
                      {canManage && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Shipment & Assignment"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(s)}
                          title="Delete Shipment"
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
            Page {page} of {totalPages} ({totalCount} consignments)
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

      {/* Add / Edit Shipment Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New Freight Shipment' : `Update Shipment #${formData.shipmentId}`}
        maxWidth="720px"
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
              <label className="form-label">Shipment Waybill ID *</label>
              <input
                type="text"
                name="shipmentId"
                className="form-control"
                value={formData.shipmentId}
                onChange={handleFormChange}
                required
                disabled={isEditModalOpen}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client / Consignee Name *</label>
              <input
                type="text"
                name="customerName"
                className="form-control"
                placeholder="e.g. Havells India, Hero MotoCorp"
                value={formData.customerName}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Contact Phone *</label>
              <input
                type="text"
                name="customerPhone"
                className="form-control"
                placeholder="+91 98110 00000"
                value={formData.customerPhone}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleFormChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Origin Address *</label>
            <input
              type="text"
              name="pickupAddress"
              className="form-control"
              placeholder="Factory / Warehouse gate address, City, State"
              value={formData.pickupAddress}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Destination Address *</label>
            <input
              type="text"
              name="deliveryAddress"
              className="form-control"
              placeholder="Consignee unloading dock address, City, State"
              value={formData.deliveryAddress}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Package Description *</label>
              <input
                type="text"
                name="packageDescription"
                className="form-control"
                placeholder="e.g. Automotive Spare Parts (Cartons)"
                value={formData.packageDescription}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Package Weight (in kg) *</label>
              <input
                type="number"
                name="packageWeight"
                className="form-control"
                min="1"
                value={formData.packageWeight}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign Commercial Vehicle</label>
              <select
                name="vehicle"
                className="form-control"
                value={formData.vehicle}
                onChange={handleFormChange}
              >
                <option value="">-- No Vehicle Assigned (Pending) --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} - {v.brand} {v.model} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Commercial Driver</label>
              <select
                name="driver"
                className="form-control"
                value={formData.driver}
                onChange={handleFormChange}
              >
                <option value="">-- No Driver Assigned (Pending) --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.driverId} - {d.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Expected Delivery Target Date *</label>
              <input
                type="date"
                name="expectedDeliveryDate"
                className="form-control"
                value={formData.expectedDeliveryDate}
                onChange={handleFormChange}
                required
              />
            </div>
            {isEditModalOpen && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  {SHIPMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Handling Notes</label>
            <textarea
              name="deliveryNotes"
              className="form-control"
              rows={2}
              placeholder="e.g. Fragile electronic items, gate pass required before 4pm"
              value={formData.deliveryNotes || ''}
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Book Shipment' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Shipment Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Consignment"
        message={`Are you sure you want to delete shipment #${selectedShipment?.shipmentId}?`}
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default Shipments;

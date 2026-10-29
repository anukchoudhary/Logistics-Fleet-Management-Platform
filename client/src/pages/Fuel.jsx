import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Fuel,
  Plus,
  TrendingUp,
  Truck,
  Trash2,
  Calendar,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDate, formatCurrency, formatMileage } from '../utils/formatters';

const FuelPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const [fuelRecords, setFuelRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    vehicle: '',
    driver: '',
    date: new Date().toISOString().slice(0, 10),
    fuelType: 'Diesel',
    litres: 100,
    pricePerLitre: 94.5,
    odometerReading: 0,
    fuelStation: '',
    receiptNumber: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchFuelData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [recordsRes, analyticsRes] = await Promise.all([
        api.get('/fuel?limit=50'),
        api.get('/fuel/analytics'),
      ]);
      setFuelRecords(recordsRes.data.fuelRecords || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fuel records.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchFuelData();
    if (canManage) {
      fetchFleetResources();
    }
  }, [fetchFuelData, canManage]);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenDelete = (r) => {
    setSelectedRecord(r);
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
      await api.post('/fuel', formData);
      setIsAddModalOpen(false);
      fetchFuelData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to log fuel record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/fuel/${selectedRecord._id}`);
      setIsDeleteModalOpen(false);
      fetchFuelData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete fuel record.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedTotal =
    Math.round(Number(formData.litres || 0) * Number(formData.pricePerLitre || 0) * 100) / 100;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Expenses & Consumption Management</h1>
          <p className="page-subtitle">
            Track fuel refills, price per litre, odometer efficiency, and monthly fleet fuel budgeting
          </p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Log Fuel Refill</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Fleet Fuel Expense"
          value={formatCurrency(analytics?.totalExpense || 0)}
          icon={Fuel}
          color="#0891b2"
          subtitle="All recorded disbursements"
        />
        <StatCard
          label="Total Fuel Consumed"
          value={`${Number(analytics?.totalLitres || 0).toLocaleString('en-IN')} Litres`}
          icon={TrendingUp}
          color="#0284c7"
          subtitle="Diesel & CNG combined"
        />
        <StatCard
          label="Average Price / Litre"
          value={`₹${analytics?.averagePricePerLitre || 0}`}
          icon={TrendingUp}
          color="#059669"
          subtitle="Across Indian highway outlets"
        />
      </div>

      {/* Analytics Grid: Monthly Trend + Vehicle-wise Usage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Expense Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Fuel Expenses Trend</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Total fuel procurement cost per month
              </div>
            </div>
            <Fuel size={16} color="var(--primary)" />
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={analytics?.monthlyExpense || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="totalCost" name="Expense (₹)" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vehicle Fuel Usage */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Vehicle-Wise Fuel Consumption</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Vehicles with highest logged fuel spend
              </div>
            </div>
            <Truck size={16} color="var(--primary)" />
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Total Litres</th>
                  <th>Total Expense</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.vehicleWiseUsage?.slice(0, 6).map((item) => (
                  <tr key={item.registrationNumber}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.registrationNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.brand} {item.model}
                      </div>
                    </td>
                    <td>{Number(item.litres).toLocaleString('en-IN')} L</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fuel Records Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Fuel Dispensation Records</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing recent fuel receipts
          </span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle Plate</th>
                <th>Driver</th>
                <th>Fuel Type</th>
                <th>Litres</th>
                <th>Rate / Litre</th>
                <th>Total Cost</th>
                <th>Odometer Reading</th>
                <th>Station / Location</th>
                <th>Receipt No.</th>
                {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : fuelRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No fuel records logged yet.
                  </td>
                </tr>
              ) : (
                fuelRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{formatDate(r.date)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {r.vehicle?.registrationNumber || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {r.vehicle?.brand} {r.vehicle?.model}
                      </div>
                    </td>
                    <td>{r.driver?.name || '—'}</td>
                    <td>
                      <span className="badge badge-neutral">{r.fuelType}</span>
                    </td>
                    <td>{r.litres} L</td>
                    <td>₹{r.pricePerLitre}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(r.totalCost)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{formatMileage(r.odometerReading)}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.fuelStation}
                    </td>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                      {r.receiptNumber || '—'}
                    </td>
                    {user?.role === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(r)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Commercial Fuel Refill"
        maxWidth="600px"
      >
        {formError && (
          <div className="alert-box alert-danger">
            <AlertTriangle size={18} />
            <div>{formError}</div>
          </div>
        )}

        <form onSubmit={handleAddSubmit}>
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
              <label className="form-label">Driver In-Charge</label>
              <select
                name="driver"
                className="form-control"
                value={formData.driver}
                onChange={handleFormChange}
              >
                <option value="">-- Select Driver --</option>
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
              <label className="form-label">Refill Date *</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
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
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity (Litres / KG) *</label>
              <input
                type="number"
                step="0.1"
                name="litres"
                className="form-control"
                min="0.1"
                value={formData.litres}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Litre (₹) *</label>
              <input
                type="number"
                step="0.05"
                name="pricePerLitre"
                className="form-control"
                min="1"
                value={formData.pricePerLitre}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          {/* Auto calculated total display */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Auto Calculated Total: ({formData.litres} L &times; ₹{formData.pricePerLitre}/L)
            </span>
            <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>
              {formatCurrency(calculatedTotal)}
            </strong>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Odometer Reading (km) *</label>
              <input
                type="number"
                name="odometerReading"
                className="form-control"
                min="0"
                value={formData.odometerReading}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice / Receipt No.</label>
              <input
                type="text"
                name="receiptNumber"
                className="form-control"
                placeholder="e.g. IOC-DEL-9910"
                value={formData.receiptNumber}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fuel Station & Location *</label>
            <input
              type="text"
              name="fuelStation"
              className="form-control"
              placeholder="e.g. Indian Oil COCO Outlet, Neemrana NH-48"
              value={formData.fuelStation}
              onChange={handleFormChange}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Log Fuel Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Record Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Fuel Record"
        message="Are you sure you want to delete this fuel record? This will adjust the fleet expense accounting."
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

export default FuelPage;

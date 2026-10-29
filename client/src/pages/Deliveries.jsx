import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Package,
  Calendar,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const STATUS_PROGRESSION = [
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

const Deliveries = () => {
  const { user } = useAuth();
  const isDriver = user?.role === 'driver';

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Status Update Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [recipientSignedBy, setRecipientSignedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/deliveries');
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assigned deliveries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleOpenUpdate = (delivery) => {
    setSelectedDelivery(delivery);
    // Suggest the next natural status step
    const currentStatus = delivery.status;
    let nextStatus = 'In Transit';
    if (currentStatus === 'Assigned' || currentStatus === 'Pending') nextStatus = 'Picked Up';
    else if (currentStatus === 'Picked Up') nextStatus = 'In Transit';
    else if (currentStatus === 'In Transit') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';

    setTargetStatus(nextStatus);
    setDeliveryNotes(delivery.deliveryNotes || '');
    setRecipientSignedBy('');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.patch(`/deliveries/${selectedDelivery._id}/update-status`, {
        status: targetStatus,
        deliveryNotes,
        recipientSignedBy: targetStatus === 'Delivered' ? recipientSignedBy : undefined,
      });

      setSuccessMessage(res.data.message || 'Delivery status successfully updated.');
      setTimeout(() => setSuccessMessage(''), 6000);
      setIsUpdateModalOpen(false);
      fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Deliveries & Trip Console</h1>
          <p className="page-subtitle">
            {isDriver
              ? 'Your active consignments, live checkpost status, and delivery acknowledgements'
              : 'Fleet-wide active delivery dispatches and commercial driver trip logs'}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="alert-box alert-info" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)' }}>
          <CheckCircle2 size={18} />
          <div>{successMessage}</div>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Deliveries Grid of Cards for easy driver accessibility */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner" />
        </div>
      ) : deliveries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Deliveries Assigned</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            There are currently no active deliveries assigned to this driver profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {deliveries.map((d) => (
            <div key={d._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consignment Waybill</span>
                    <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      #{d.shipmentId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span
                      className={`badge ${
                        d.priority === 'Urgent'
                          ? 'badge-danger'
                          : d.priority === 'High'
                          ? 'badge-warning'
                          : 'badge-neutral'
                      }`}
                    >
                      {d.priority}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>

                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {d.customerName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Cargo: {d.packageDescription} ({Number(d.packageWeight).toLocaleString('en-IN')} kg)
                </div>

                {/* Origin / Destination Box */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Pickup:</strong>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{d.pickupAddress}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Destination:</strong>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{d.deliveryAddress}</span>
                  </div>
                </div>

                {/* Vehicle & Driver details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <div>
                    Vehicle: <strong>{d.vehicle?.registrationNumber || 'Unassigned'}</strong>
                  </div>
                  <div>
                    Target: <strong>{formatDate(d.expectedDeliveryDate)}</strong>
                  </div>
                </div>

                {d.deliveryNotes && (
                  <div style={{ fontSize: '11px', color: '#854d0e', background: '#fefce8', padding: '6px 10px', borderRadius: '4px', marginBottom: '14px' }}>
                    <strong>Note:</strong> {d.deliveryNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Link to={`/shipments/${d._id}`} className="btn btn-secondary btn-sm">
                  <Eye size={13} />
                  <span>Timeline</span>
                </Link>

                {d.status !== 'Delivered' && d.status !== 'Cancelled' ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenUpdate(d)}
                  >
                    <Send size={13} />
                    <span>Update Trip Status</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Trip Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Trip Status: #${selectedDelivery?.shipmentId}`}
        maxWidth="500px"
      >
        <form onSubmit={handleUpdateSubmit}>
          <div className="form-group">
            <label className="form-label">Next Trip Milestone *</label>
            <select
              className="form-control"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              required
            >
              <option value="Picked Up">Picked Up (Loaded at origin depot)</option>
              <option value="In Transit">In Transit (Highway transport en route)</option>
              <option value="Out for Delivery">Out for Delivery (Local delivery run)</option>
              <option value="Delivered">Delivered (Handed over & signed at destination)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Driver Delivery Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Cleared toll, goods in good condition, unloaded at dock 3"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
            />
          </div>

          {targetStatus === 'Delivered' && (
            <div className="form-group">
              <label className="form-label">Recipient Signed By (Proof of Delivery) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mr. S. Kulkarni (Store Manager)"
                value={recipientSignedBy}
                onChange={(e) => setRecipientSignedBy(e.target.value)}
                required={targetStatus === 'Delivered'}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                * When marked as delivered, the system automatically frees your truck and driver profile back to "Available" status.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : targetStatus === 'Delivered' ? 'Confirm Delivery' : 'Broadcast Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deliveries;

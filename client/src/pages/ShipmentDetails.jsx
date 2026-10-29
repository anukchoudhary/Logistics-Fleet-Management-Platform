import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  Package,
  ArrowLeft,
  Truck,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/formatters';

const STATUS_OPTIONS = [
  'Pending',
  'Assigned',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ShipmentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager' || user?.role === 'driver';

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [recipientSignedBy, setRecipientSignedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/shipments/${id}`);
      setShipment(res.data.shipment);
      setNewStatus(res.data.shipment.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/shipments/${shipment._id}/status`, {
        status: newStatus,
        note: statusNote,
        recipientSignedBy: newStatus === 'Delivered' ? recipientSignedBy : undefined,
      });
      setIsStatusModalOpen(false);
      setStatusNote('');
      fetchShipmentDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div>
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error || 'Shipment not found.'}</div>
        </div>
        <Link to="/shipments" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Shipments
        </Link>
      </div>
    );
  }

  const timeline = shipment.timeline || [];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/shipments"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={14} /> Back to Shipments
        </Link>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-title" style={{ fontFamily: 'monospace' }}>
                Waybill #{shipment.shipmentId}
              </h1>
              <StatusBadge status={shipment.status} />
              <span
                className={`badge ${
                  shipment.priority === 'Urgent'
                    ? 'badge-danger'
                    : shipment.priority === 'High'
                    ? 'badge-warning'
                    : 'badge-neutral'
                }`}
              >
                {shipment.priority} Priority
              </span>
            </div>
            <p className="page-subtitle">
              Client: {shipment.customerName} &bull; Target Delivery: {formatDate(shipment.expectedDeliveryDate)}
            </p>
          </div>
          {canManage && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setNewStatus(shipment.status);
                setIsStatusModalOpen(true);
              }}
            >
              <Send size={14} />
              <span>Progress Status</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left Column: Route, Package, Fleet Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Origin & Destination Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Origin & Destination Route</div>
              <MapPin size={16} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Origin (Pickup Location)
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{shipment.pickupAddress}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Destination (Consignee Dock)
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{shipment.deliveryAddress}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer Phone:</span>
                <strong>{shipment.customerPhone}</strong>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Freight Specifications</div>
              <Package size={16} color="var(--primary)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Cargo Description</div>
                <div style={{ fontWeight: 600 }}>{shipment.packageDescription}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Consignment Weight</div>
                <div style={{ fontWeight: 600 }}>{Number(shipment.packageWeight).toLocaleString('en-IN')} kg</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Booking Date</div>
                <div style={{ fontWeight: 600 }}>{formatDate(shipment.createdDate)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actual Delivery Date</div>
                <div style={{ fontWeight: 600 }}>{shipment.actualDeliveryDate ? formatDate(shipment.actualDeliveryDate) : 'Pending Delivery'}</div>
              </div>
            </div>
            {shipment.deliveryNotes && (
              <div style={{ marginTop: '14px', background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                <strong>Handling Instructions:</strong> {shipment.deliveryNotes}
              </div>
            )}
            {shipment.recipientSignedBy && (
              <div style={{ marginTop: '12px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--success)' }}>
                <strong>Acknowledged By:</strong> {shipment.recipientSignedBy}
              </div>
            )}
          </div>

          {/* Assigned Fleet Vehicle & Driver */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Allocated Transport Resources</div>
              <Truck size={16} color="var(--primary)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Assigned Truck</div>
                {shipment.vehicle ? (
                  <div>
                    <div style={{ fontWeight: 700 }}>{shipment.vehicle.registrationNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {shipment.vehicle.brand} {shipment.vehicle.model}
                    </div>
                    <Link to={`/vehicles/${shipment.vehicle._id}`} style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', display: 'inline-block' }}>
                      View Vehicle Specs &rarr;
                    </Link>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Pending Allocation</span>
                )}
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Commercial Driver</div>
                {shipment.driver ? (
                  <div>
                    <div style={{ fontWeight: 700 }}>{shipment.driver.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Phone: {shipment.driver.phone}
                    </div>
                    <Link to={`/drivers/${shipment.driver._id}`} style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', display: 'inline-block' }}>
                      Driver Profile &rarr;
                    </Link>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Pending Driver Allocation</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Status Timeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Dispatch Timeline & Milestones</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Chronological chain of custody and checkpost updates
              </div>
            </div>
            <Clock size={16} color="var(--primary)" />
          </div>

          <div className="timeline">
            {timeline.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No status history recorded yet.
              </div>
            ) : (
              timeline.map((entry, idx) => {
                const isLatest = idx === timeline.length - 1;
                return (
                  <div key={idx} className="timeline-item">
                    <span className={`timeline-marker ${isLatest ? 'active' : ''}`} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="timeline-title">{entry.status}</span>
                      <span className="timeline-time">{formatDateTime(entry.timestamp)}</span>
                    </div>
                    {entry.note && <div className="timeline-note">{entry.note}</div>}
                    {entry.updatedBy && (
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                        Updated by: {entry.updatedBy}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Progress Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Shipment Status: #${shipment.shipmentId}`}
        maxWidth="500px"
      >
        <form onSubmit={handleUpdateStatusSubmit}>
          <div className="form-group">
            <label className="form-label">Change Status To *</label>
            <select
              className="form-control"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Checkpoint / Progress Note</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Crosscheck completed at Neemrana border plaza, driver proceeding normally"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>

          {newStatus === 'Delivered' && (
            <div className="form-group">
              <label className="form-label">Recipient Signed By (Proof of Delivery) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mr. Rajesh Sharma (Receiving Manager)"
                value={recipientSignedBy}
                onChange={(e) => setRecipientSignedBy(e.target.value)}
                required={newStatus === 'Delivered'}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Note: Marking delivered will automatically update vehicle and driver status back to "Available" in the system.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save & Broadcast Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShipmentDetails;

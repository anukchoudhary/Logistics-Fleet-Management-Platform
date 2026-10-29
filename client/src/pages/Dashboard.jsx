import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Truck,
  Users,
  Package,
  CheckCircle,
  Clock,
  Wrench,
  Fuel,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const res = await api.get('/reports/dashboard');
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load live fleet analytics. Please verify server connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box alert-danger">
        <AlertTriangle size={20} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Connection Error</div>
          <div>{error}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentShipments = data?.recentShipments || [];

  return (
    <div>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Command & Operations Center</h1>
          <p className="page-subtitle">
            Real-time telematics, shipment tracking, and operational analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spinner' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telematics'}</span>
          </button>
          <Link to="/shipments" className="btn btn-primary">
            <Package size={14} />
            <span>New Shipment</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid (9 Metrics) */}
      <div className="stat-grid">
        <StatCard
          label="Total Fleet Vehicles"
          value={kpis.totalVehicles}
          icon={Truck}
          color="#1e3a8a"
          subtitle={`${kpis.availableVehicles} Available / ${kpis.inTransitVehicles} Active`}
        />
        <StatCard
          label="Vehicles in Transit"
          value={kpis.inTransitVehicles}
          icon={Truck}
          color="#2563eb"
          subtitle="En route on Indian corridors"
        />
        <StatCard
          label="Active Drivers"
          value={kpis.totalDrivers}
          icon={Users}
          color="#059669"
          subtitle={`${kpis.availableDrivers} Ready / ${kpis.onTripDrivers} On Highway`}
        />
        <StatCard
          label="Active Shipments"
          value={kpis.activeShipments}
          icon={Package}
          color="#d97706"
          subtitle="In Transit / Out for Delivery"
        />
        <StatCard
          label="Delivered Shipments"
          value={kpis.deliveredShipments}
          icon={CheckCircle}
          color="#16a34a"
          subtitle="Completed consignments"
        />
        <StatCard
          label="Pending Dispatch"
          value={kpis.pendingShipments}
          icon={Clock}
          color="#64748b"
          subtitle="Awaiting vehicle allocation"
        />
        <StatCard
          label="Maintenance Due"
          value={kpis.maintenanceDueCount}
          icon={Wrench}
          color="#dc2626"
          subtitle="Inspection due in 7 days"
        />
        <StatCard
          label="Total Fuel Expense"
          value={formatCurrency(kpis.totalFuelExpenses)}
          icon={Fuel}
          color="#0891b2"
          subtitle="Logged diesel & CNG fills"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Deliveries Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Deliveries Trend</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Consignments fulfilled vs total booked
              </div>
            </div>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={charts.monthlyDeliveries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="created" name="Booked" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Fleet Utilization */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Vehicle Fleet Utilization</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Current live allocation of commercial fleet
              </div>
            </div>
            <Truck size={18} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: 260 }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={charts.vehicleUtilization}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {charts.vehicleUtilization?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '160px', paddingRight: '12px' }}>
              {charts.vehicleUtilization?.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                    <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  </div>
                  <strong style={{ color: 'var(--text-main)' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Expenses: Fuel vs Maintenance */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Operating Expenses: Fuel & Maintenance</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Monthly recurring fleet operations cost (INR)
              </div>
            </div>
            <Fuel size={18} color="var(--primary)" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={charts.monthlyExpensesTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="fuel" name="Fuel (₹)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="maintenance" name="Maintenance (₹)" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipment Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Shipment Pipeline Status</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Count of shipments by operational lifecycle stage
              </div>
            </div>
            <Package size={18} color="var(--primary)" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={charts.shipmentStatusDistribution}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={90} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Shipments" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Live Shipments Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Active Freight & Recent Consignments</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Most recent transport orders moving through logistics corridors
            </div>
          </div>
          <Link to="/shipments" style={{ fontSize: '13px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Customer / Consignee</th>
                <th>Destination</th>
                <th>Assigned Vehicle</th>
                <th>Driver</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Booking Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No recent shipments found.
                  </td>
                </tr>
              ) : (
                recentShipments.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link
                        to={`/shipments/${s._id}`}
                        style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}
                      >
                        #{s.shipmentId}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.customerName}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.deliveryAddress}
                    </td>
                    <td>
                      {s.vehicle ? (
                        <span style={{ fontWeight: 600 }}>{s.vehicle.registrationNumber}</span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>
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
                      <StatusBadge status={s.status} />
                    </td>
                    <td>{formatDate(s.createdDate)}</td>
                    <td>
                      <Link to={`/shipments/${s._id}`} className="btn btn-secondary btn-sm">
                        View
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

export default Dashboard;

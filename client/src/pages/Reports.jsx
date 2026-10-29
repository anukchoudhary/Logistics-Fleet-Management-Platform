import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { exportToCsv } from '../utils/exportCsv';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'fleet', name: 'Fleet Utilization & Compliance' },
  { id: 'deliveries', name: 'Delivery Performance' },
  { id: 'drivers', name: 'Commercial Driver Performance' },
  { id: 'fuel', name: 'Fuel Expenses & Consumption' },
  { id: 'maintenance', name: 'Maintenance & Repairs Audit' },
];

const Reports = () => {
  const [reportType, setReportType] = useState('fleet');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('Fleet Utilization Report');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get(`/reports/export?${params.toString()}`);
      setReportData(res.data.data || []);
      setReportTitle(res.data.title || 'Logistics Report');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = () => {
    const filename = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCsv(reportData, filename);
  };

  const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Reports & Compliance Auditing</h1>
          <p className="page-subtitle">
            Generate granular CSV exports and cross-sectional audits across vehicles, consignments, and drivers
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExportCsv}
          disabled={reportData.length === 0 || loading}
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Filter and Report Selector Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: '240px', flex: 1 }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>
              Select Report Dataset
            </label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>
              Start Date
            </label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>
              End Date
            </label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset Dates
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchReport}
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{reportTitle}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {reportData.length} records matching criteria
            </div>
          </div>
          <FileSpreadsheet size={18} color="var(--primary)" />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No report data found for selected filters.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col}>
                        {typeof row[col] === 'number'
                          ? row[col].toLocaleString('en-IN')
                          : row[col] || '—'}
                      </td>
                    ))}
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

export default Reports;

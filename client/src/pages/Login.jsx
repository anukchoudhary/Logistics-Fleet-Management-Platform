import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your corporate email address and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(email, password);
      if (user.role === 'driver') {
        navigate('/deliveries');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Brand header */}
        <div
          style={{
            backgroundColor: '#1e3a8a',
            padding: '28px 24px',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Truck size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Logistics & Fleet Management
          </h1>
          <p style={{ fontSize: '12px', color: '#bfdbfe', marginTop: '4px' }}>
            Enterprise Fleet Operations Portal (HCL Training Project)
          </p>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {error && (
            <div className="alert-box alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Corporate Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="e.g. manager@logistics.hcl.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderColor: '#ffffff', borderTopColor: 'transparent' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Sign In to Platform</span>
                </>
              )}
            </button>
          </form>

          {/* Seed demo quick-fill helper */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="var(--primary)" />
              Demo Accounts (One-Click Selection)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() =>
                  handleQuickDemo('admin@logistics.hcl.internal', 'Admin@2026')
                }
              >
                <span>
                  <strong>Admin:</strong> Arunav Sengupta
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Access</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() =>
                  handleQuickDemo('manager@logistics.hcl.internal', 'Manager@2026')
                }
              >
                <span>
                  <strong>Fleet Manager:</strong> Pooja Deshmukh
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operations</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() =>
                  handleQuickDemo('rajesh.driver@logistics.hcl.internal', 'Driver@2026')
                }
              >
                <span>
                  <strong>Driver:</strong> Rajesh Kumar
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deliveries</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

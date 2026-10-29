import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <Compass size={54} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>404 - Route Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px', fontSize: '14px' }}>
        The dispatch URL or route resource you requested does not exist on the LogiX Fleet management platform.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Command Dashboard
      </Link>
    </div>
  );
};

export default NotFound;

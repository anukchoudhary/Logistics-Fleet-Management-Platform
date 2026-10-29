import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)', subtitle }) => {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ color }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

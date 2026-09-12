import React from 'react';

const THEMES = {
  blue: { bg: '#eff6ff', icon: '#3b82f6', border: '#dbeafe' },
  green: { bg: '#f0fdf4', icon: '#22c55e', border: '#dcfce7' },
  purple: { bg: '#faf5ff', icon: '#a855f7', border: '#f3e8ff' },
  amber: { bg: '#fffbeb', icon: '#f59e0b', border: '#fef3c7' },
  rose: { bg: '#fff1f2', icon: '#f43f5e', border: '#ffe4e6' },
};

const StatCard = ({ icon, label, value, subtitle, color = 'blue' }) => {
  const theme = THEMES[color] || THEMES.blue;
  return (
    <div className="stat-card">
      <div
        className="stat-card-icon"
        style={{ background: theme.bg, color: theme.icon, border: `1px solid ${theme.border}` }}
      >
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;

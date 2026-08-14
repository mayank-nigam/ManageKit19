import React, { useState, useEffect } from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiTrendingUp, FiShield, FiSettings, FiLock, FiCheck, FiLayers, FiStar, FiSpeaker, FiRefreshCw, FiHelpCircle, FiCalendar, FiClock, FiImage, FiMoreHorizontal, FiFolder } from 'react-icons/fi';
import { getSession } from '../getSession';
import API_ENDPOINTS from '../config/apiEndpoints';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';

// Reusable Metric Card matching Image 2 & 3 styling exactly
const StatCard = ({ title, value, change, changeText, icon: Icon, bgClass, textClass }) => (
  <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className={bgClass}>
        <Icon style={{ width: '24px', height: '24px' }} className={textClass || 'text-white'} />
      </div>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937', lineHeight: '1.2' }}>{title}</h3>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <p style={{ margin: 0, fontSize: '40px', fontWeight: 700, color: '#111827', lineHeight: '1', letterSpacing: '-0.02em' }}>{value}</p>
      {change && (
        <p style={{ margin: '12px 0 0 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontWeight: 600, color: change.startsWith('+') ? '#10b981' : '#ef4444' }}>
            {change}
          </span>
          <span style={{ color: '#6b7280' }}>{changeText}</span>
        </p>
      )}
    </div>
  </div>
);

// Parent/Admin Dashboard
const AdminDashboard = ({ counts }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [showAllBanners, setShowAllBanners] = useState(false);
  
  // Need useNavigate for redirection
  const navigate = require('react-router-dom').useNavigate();

  const systemUpdates = counts.SystemUpdatesList || [];
  const activeBanners = counts.ActiveBannersList || [];
  
  const rolesData = counts.RolesList || [];
  const totalRoleUsers = rolesData.reduce((sum, role) => sum + role.count, 0) || 1;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
  
  let currentOffset = 0;
  const segments = rolesData.map((role, idx) => {
    const pct = role.count / totalRoleUsers;
    const dash = pct * 100;
    const gap = 100 - dash;
    const offset = 25 - currentOffset;
    currentOffset += dash;
    return {
      ...role,
      pct: Math.round(pct * 100),
      color: colors[idx % colors.length],
      dash,
      gap,
      offset
    };
  });

  const displayUpdates = showAllUpdates ? systemUpdates : systemUpdates.slice(0, 3);
  const displayBanners = showAllBanners ? activeBanners : activeBanners.slice(0, 3);

  // Clickable Wrapper for StatCard
  const ClickableCard = ({ route, children }) => (
    <div 
      onClick={() => route && navigate(route)} 
      style={{ cursor: route ? 'pointer' : 'default', transition: 'transform 0.2s', height: '100%' }}
      onMouseEnter={e => route && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => route && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {children}
    </div>
  );

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          Dashboard Overview
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Key network metrics and configurations</p>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <ClickableCard route="/roles-and-rights/user-role-mapping">
          <StatCard title={<span>Child<br/>Users</span>} value={counts.TotalChildUsers || '0'} change="" changeText="" icon={FiUsers} bgClass="bg-blue-600" />
        </ClickableCard>
        <ClickableCard route="/roles-and-rights/roles">
          <StatCard title={<span>Total<br/>Roles</span>} value={counts.TotalRoles || '0'} change="" changeText="" icon={FiSettings} bgClass="bg-orange-500" />
        </ClickableCard>
        <ClickableCard route="/teams">
          <StatCard title={<span>Collaborator<br/>Teams</span>} value={counts.TotalTeams || '0'} change="" changeText="" icon={FiLock} bgClass="bg-purple-500" />
        </ClickableCard>
        <ClickableCard route="/settings/configurations">
          <StatCard title={<span>Masked<br/>Configurations</span>} value={counts.MaskedConfigurations || '0'} change="" changeText="" icon={FiCheck} bgClass="bg-emerald-500" />
        </ClickableCard>
      </div>
      
      {/* Analytics Row */}
      {rolesData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Users by Role</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
              <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {segments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="21" cy="21" r="15.91549430918954"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="6"
                      strokeDasharray={`${seg.dash} ${seg.gap}`}
                      strokeDashoffset={seg.offset}
                      style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hoveredSegment === idx || hoveredSegment === null ? 1 : 0.3 }}
                      onMouseEnter={() => setHoveredSegment(idx)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => navigate(`/roles-and-rights/roles`)}
                    />
                  ))}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{rolesData.reduce((a,b)=>a+b.count,0)}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Users</p>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                {segments.map((seg, idx) => (
                  <div 
                    key={idx} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: hoveredSegment === idx ? '#f8fafc' : 'transparent' }}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => navigate(`/roles-and-rights/roles`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: seg.color }}></div>
                      <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>{seg.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{seg.count}</span>
                      <span style={{ color: '#6b7280', fontSize: '14px', width: '40px', textAlign: 'right' }}>{seg.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Lists Row: Updates & Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* System Updates */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Recent System Updates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayUpdates.map((update) => (
              <div key={update.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#111827' }}>{update.title}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCalendar style={{ width: '13px', height: '13px' }} /> Created: {update.date || 'N/A'}
                    </p>
                    {update.expireDate && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock style={{ width: '13px', height: '13px' }} /> Exp: {update.expireDate}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: update.status === 'Active' ? '#d1fae5' : '#f3f4f6', color: update.status === 'Active' ? '#047857' : '#4b5563' }}>
                  {update.status}
                </span>
              </div>
            ))}
            {displayUpdates.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No updates available.</p>}
          </div>
          {systemUpdates.length > 3 && (
            <button 
              onClick={() => setShowAllUpdates(!showAllUpdates)}
              style={{ marginTop: '24px', width: '100%', padding: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#3b82f6', fontSize: '14px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {showAllUpdates ? 'Show Less' : `View All (${systemUpdates.length})`}
            </button>
          )}
        </div>

        {/* Active Banners */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Active Banners</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayBanners.map((banner) => (
              <div key={banner.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiImage style={{ width: '20px', height: '20px', color: '#d97706' }} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#111827' }}>{banner.title}</p>
                    {banner.expireDate && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock style={{ width: '13px', height: '13px' }} /> Exp: {banner.expireDate}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: banner.status === 'Live' ? '#d1fae5' : '#ffedd5', color: banner.status === 'Live' ? '#047857' : '#c2410c' }}>
                  {banner.status}
                </span>
              </div>
            ))}
            {displayBanners.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No active banners.</p>}
          </div>
          {activeBanners.length > 3 && (
            <button 
              onClick={() => setShowAllBanners(!showAllBanners)}
              style={{ marginTop: '24px', width: '100%', padding: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#d97706', fontSize: '14px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {showAllBanners ? 'Show Less' : `View All (${activeBanners.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Superadmin Dashboard (User 335)
const SuperadminDashboard = ({ counts }) => {
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [showAllBanners, setShowAllBanners] = useState(false);
  const [showAllHelp, setShowAllHelp] = useState(false);

  const systemUpdates = counts.SystemUpdatesList || [];
  const activeBanners = counts.ActiveBannersList || [];
  const helpList = counts.HelpList || [];

  const displayUpdates = showAllUpdates ? systemUpdates : systemUpdates.slice(0, 5);
  const displayBanners = showAllBanners ? activeBanners : activeBanners.slice(0, 3);
  const displayHelp = showAllHelp ? helpList : helpList.slice(0, 3);

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          Superadmin System Overview
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>System metrics and global configurations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title={<span>Active Parent<br/>Users</span>} value={counts.ActiveParentUsers || '0'} change="" changeText="" icon={FiUsers} bgClass="bg-blue-600" />
        <StatCard title={<span>Expiring Subs<br/>(30 Days)</span>} value={counts.ExpiringSubscriptionsCount || '0'} change="" changeText="" icon={FiClock} bgClass="bg-orange-500" />
        <StatCard title={<span>System<br/>Updates</span>} value={counts.SystemUpdatesCount || '0'} change="" changeText="" icon={FiRefreshCw} bgClass="bg-purple-500" />
        <StatCard title={<span>Active<br/>Banners</span>} value={counts.ActiveBannersCount || '0'} change="" changeText="" icon={FiImage} bgClass="bg-emerald-500" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Help Content Manager */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
           <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Help Documentation Status</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {displayHelp.map((hItem, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'border-color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'} onMouseLeave={e => e.currentTarget.style.borderColor = '#f3f4f6'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiHelpCircle style={{ color: '#8b5cf6', width: '20px', height: '20px' }} />
                    <div>
                       <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#374151', fontSize: '14px' }}>{hItem.title}</p>
                       {hItem.createdDate && (
                         <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Added: {hItem.createdDate}</p>
                       )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hItem.status ? '#10b981' : '#d1d5db' }}></div>
                     <span style={{ fontSize: '13px', color: '#6b7280' }}>{hItem.status ? 'Live' : 'Draft'}</span>
                  </div>
                </div>
              ))}
              {displayHelp.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No help content uploaded.</p>}
           </div>
           {helpList.length > 3 && (
              <button 
                onClick={() => setShowAllHelp(!showAllHelp)}
                style={{ marginTop: '16px', width: '100%', padding: '10px', border: '1px dashed #e5e7eb', backgroundColor: '#faf5ff', color: '#7c3aed', fontSize: '14px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3e8ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
              >
                {showAllHelp ? 'Collapse Help' : `Manage All (${counts.HelpCount || helpList.length})`}
              </button>
            )}
        </div>

        {/* Updates and Banners Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* System Updates */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Recent System Updates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayUpdates.map((update) => (
                <div key={update.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#111827' }}>{update.title}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCalendar style={{ width: '13px', height: '13px' }} /> Created: {update.date || 'N/A'}
                      </p>
                      {update.expireDate && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock style={{ width: '13px', height: '13px' }} /> Exp: {update.expireDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: update.status === 'Active' ? '#d1fae5' : '#f3f4f6', color: update.status === 'Active' ? '#047857' : '#4b5563' }}>
                    {update.status}
                  </span>
                </div>
              ))}
              {displayUpdates.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No updates available.</p>}
            </div>
            {systemUpdates.length > 5 && (
              <button 
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                style={{ marginTop: '24px', width: '100%', padding: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#3b82f6', fontSize: '14px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {showAllUpdates ? 'Show Less' : `View All (${systemUpdates.length})`}
              </button>
            )}
          </div>

          {/* Active Banners */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Banners Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayBanners.map((banner) => (
                <div key={banner.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiImage style={{ width: '20px', height: '20px', color: '#d97706' }} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#111827' }}>{banner.title}</p>
                      {banner.expireDate && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock style={{ width: '13px', height: '13px' }} /> Exp: {banner.expireDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: banner.status === 'Live' ? '#d1fae5' : '#ffedd5', color: banner.status === 'Live' ? '#047857' : '#c2410c' }}>
                    {banner.status}
                  </span>
                </div>
              ))}
              {displayBanners.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No active banners.</p>}
            </div>
            {activeBanners.length > 3 && (
              <button 
                onClick={() => setShowAllBanners(!showAllBanners)}
                style={{ marginTop: '24px', width: '100%', padding: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#d97706', fontSize: '14px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {showAllBanners ? 'Show Less' : `View All (${activeBanners.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { userId } = getSession() || {};
  const [counts, setCounts] = useState({
    ActiveParentUsers: 0,
    ExpiringSubscriptionsCount: 0,
    TotalChildUsers: 0,
    TotalRoles: 0,
    TotalTeams: 0,
    MaskedConfigurations: 0
  });

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const payload = {
          Token: API_ENDPOINTS.TOKEN.UNIVERSAL_TOKEN,
          Details: JSON.stringify({ Mode: 'ManageDashCount', UserId: userId })
        };

        const apiUrl = `${NEWV3_BASE_URL}Common/CommonActionModebased`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data && data.Status === 1 && data.Details && data.Details.length > 0) {
          const result = JSON.parse(data.Details[0].JsonResult);
          setCounts(result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard counts:', error);
      }
    };

    if (userId) {
      fetchDashboardCounts();
    }
  }, [userId]);

  if (userId === 335) {
    return <SuperadminDashboard counts={counts} />;
  } 
  
  return <AdminDashboard counts={counts} />;
};

export default DashboardHome;

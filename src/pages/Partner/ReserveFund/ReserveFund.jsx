import React, { useState, useCallback } from 'react';
import { Tabs, AutoComplete, Button } from 'antd';
import { Wallet, Lock, Unlock, Eye, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

import StatCard from '../shared/StatCard';
import ReserveFundGrid from './components/ReserveFundGrid';
import AuditLogGrid from './components/AuditLogGrid';
import ManageFundDrawer from './components/ManageFundDrawer';

import '../shared/PartnerCommon.css';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const ReserveFund = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [reservedFund, setReservedFund] = useState(0);
  const [unreservedBalance, setUnreservedBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('reserve');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchUserName, setSearchUserName] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('manage');
  const [selectedFund, setSelectedFund] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatsUpdate = useCallback((stats) => {
    setTotalBalance(stats.totalMoney || 0);
    setReservedFund(stats.totalReservedFunds || 0);
    setUnreservedBalance(stats.totalUnreservedFunds || 0);
  }, []);

  const handleUserSearch = async (value) => {
    setSearchUserName(value);
    if (!value || value.length < 1) {
      setUserOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.RESERVE_FUND.USER_SUGGESTIONS}`, {
        Token: token || TokenId,
        Details: {
          FilterText: value,
          UserId: String(userId || ''),
        },
      });

      const suggestions = res.data?.Details || [];
      setUserOptions(
        suggestions.map((u) => ({
          value: u.UserLogin,
          userId: u.UserId,
          label: u.UserLogin,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch user suggestions:', err);
      setUserOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = (value, option) => {
    setSearchUserName(option.label);
    setSearchUserId(option.userId);
  };

  const handleSearch = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setSearchUserId('');
    setSearchUserName('');
    setRefreshKey((k) => k + 1);
  };

  const handleManageFund = (fund = null, mode = 'manage') => {
    setSelectedFund(fund);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedFund(null);
  };

  const handleDrawerSuccess = () => {
    handleDrawerClose();
    setRefreshKey((k) => k + 1);
  };

  const handleViewTransaction = (fund) => {
    if (fund && fund.TransactionUrl) {
      window.open(fund.TransactionUrl, '_blank');
    }
  };

  const tabItems = [
    {
      key: 'reserve',
      label: (
        <span className="tab-label">
          <Wallet size={15} />
          Reserve Fund
        </span>
      ),
      children: (
        <ReserveFundGrid
          searchUserId={searchUserId}
          onManageFund={handleManageFund}
          onViewTransaction={handleViewTransaction}
          refreshKey={refreshKey}
          onStatsUpdate={handleStatsUpdate}
        />
      ),
    },
    {
      key: 'audit',
      label: (
        <span className="tab-label">
          <Eye size={15} />
          Audit Log
        </span>
      ),
      children: (
        <AuditLogGrid
          searchUserId={searchUserId}
          refreshKey={refreshKey}
        />
      ),
    },
  ];

  return (
    <div className="reserve-fund-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Reserve Fund</h1>
          <p className="page-subtitle">Manage reserved funds and view transaction history</p>
        </div>
        <div className="page-header-actions">
          <Button
            className="refresh-btn"
            icon={<RefreshCw size={15} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="balance-cards-row">
        <StatCard
          icon={<Wallet size={22} />}
          label="Total Balance"
          value={totalBalance}
          color="blue"
        />
        <StatCard
          icon={<Lock size={22} />}
          label="Reserved Fund"
          value={reservedFund}
          color="amber"
        />
        <StatCard
          icon={<Unlock size={22} />}
          label="Unreserved Balance"
          value={unreservedBalance}
          color="green"
        />
      </div>

      <div className="toolbar-card">
        <div className="toolbar-left">
          <span className="toolbar-label">User:</span>
          <AutoComplete
            className="user-search-field"
            options={userOptions}
            onSearch={handleUserSearch}
            onSelect={handleUserSelect}
            value={searchUserName}
            onChange={(val) => setSearchUserName(val)}
            placeholder="Search User"
            notFoundContent={searchLoading ? 'Searching...' : 'No results'}
            filterOption={false}
          />
          <Button
            type="primary"
            className="search-btn"
            icon={<Search size={15} />}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>

      <div className="table-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="reserve-fund-tabs"
        />
      </div>

      <ManageFundDrawer
        open={drawerOpen}
        mode={drawerMode}
        fund={selectedFund}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
        searchUserId={searchUserId}
      />
    </div>
  );
};

export default ReserveFund;

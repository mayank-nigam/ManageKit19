import React, { useState, useCallback } from 'react';
import { Select, DatePicker, Button, Input } from 'antd';
import { RefreshCw, Search } from 'lucide-react';
import dayjs from 'dayjs';

import VerifyKYCGrid from './components/VerifyKYCGrid';
import ViewDocumentsDrawer from './components/ViewDocumentsDrawer';
import HistoryDrawer from './components/HistoryDrawer';

import '../shared/PartnerCommon.css';

const { RangePicker } = DatePicker;

const VerifyKYC = () => {
  const [filters, setFilters] = useState({
    searchText: '',
    status: '0',
    fromDate: dayjs().startOf('month').format('DD-MMM-YYYY'),
    toDate: dayjs().endOf('month').format('DD-MMM-YYYY'),
    dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        dateRange: dates,
        fromDate: dates[0].format('DD-MMM-YYYY'),
        toDate: dates[1].format('DD-MMM-YYYY'),
      }));
    }
  };

  const handleSearch = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setFilters({
      searchText: '',
      status: '0',
      fromDate: dayjs().startOf('month').format('DD-MMM-YYYY'),
      toDate: dayjs().endOf('month').format('DD-MMM-YYYY'),
      dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
    });
    setRefreshKey((k) => k + 1);
  };

  const handleView = useCallback((row) => {
    setSelectedRow(row);
    setViewDrawerOpen(true);
  }, []);

  const handleHistory = useCallback((row) => {
    setSelectedRow(row);
    setHistoryDrawerOpen(true);
  }, []);

  const handleViewDrawerClose = () => {
    setViewDrawerOpen(false);
    setSelectedRow(null);
  };

  const handleHistoryDrawerClose = () => {
    setHistoryDrawerOpen(false);
    setSelectedRow(null);
  };

  const handleActionSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="verify-kyc-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Verify KYC</h1>
          <p className="page-subtitle">Review and verify user KYC documents</p>
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

      <div className="toolbar-card">
        <div className="toolbar-left">
          <RangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            className="date-range-picker"
            format="DD-MMM-YYYY"
            presets={[
              { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              { label: 'This Week', value: [dayjs().subtract(6, 'days'), dayjs()] },
              { label: 'Last 30 Days', value: [dayjs().subtract(29, 'days'), dayjs()] },
            ]}
          />
          <Input
            placeholder="Search User Name"
            prefix={<Search size={15} className="search-icon" />}
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            onPressEnter={handleSearch}
            className="search-input"
            allowClear
          />
          <Select
            value={filters.status}
            onChange={(val) => handleFilterChange('status', val)}
            className="status-select"
            options={[
              { label: 'All', value: '0' },
              { label: 'Approved', value: '3' },
              { label: 'Pending', value: '1' },
              { label: 'Rejected', value: '2' },
            ]}
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
        <VerifyKYCGrid
          filters={filters}
          refreshKey={refreshKey}
          onView={handleView}
          onHistory={handleHistory}
        />
      </div>

      <ViewDocumentsDrawer
        open={viewDrawerOpen}
        row={selectedRow}
        onClose={handleViewDrawerClose}
        onSuccess={handleActionSuccess}
      />

      <HistoryDrawer
        open={historyDrawerOpen}
        row={selectedRow}
        onClose={handleHistoryDrawerClose}
      />
    </div>
  );
};

export default VerifyKYC;

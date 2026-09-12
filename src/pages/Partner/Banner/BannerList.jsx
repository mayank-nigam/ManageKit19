import React, { useState, useCallback } from 'react';
import { Button, Input } from 'antd';
import { RefreshCw, Plus, Search } from 'lucide-react';

import BannerGrid from './components/BannerGrid';
import BannerFormDrawer from './components/BannerFormDrawer';

import '../shared/PartnerCommon.css';

const BannerList = () => {
  const [searchText, setSearchText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const handleSearch = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setSearchText('');
    setRefreshKey((k) => k + 1);
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setDrawerOpen(true);
  };

  const handleEdit = useCallback((banner) => {
    setEditingBanner(banner);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingBanner(null);
  };

  const handleSuccess = () => {
    handleDrawerClose();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="banner-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Banner</h1>
          <p className="page-subtitle">Manage banners and notifications</p>
        </div>
        <div className="page-header-actions">
          <Button
            className="refresh-btn"
            icon={<RefreshCw size={15} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            className="add-btn"
            icon={<Plus size={15} />}
            onClick={handleAdd}
          >
            Add Banner
          </Button>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-left">
          <Input
            placeholder="Search by Name"
            prefix={<Search size={15} className="search-icon" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            className="search-input"
            allowClear
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
        <BannerGrid
          searchText={searchText}
          refreshKey={refreshKey}
          onEdit={handleEdit}
        />
      </div>

      <BannerFormDrawer
        open={drawerOpen}
        banner={editingBanner}
        onClose={handleDrawerClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default BannerList;

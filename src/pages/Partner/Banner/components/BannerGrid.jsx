import React, { useEffect, useRef, useState } from 'react';
import { Button, Table, message } from 'antd';
import { MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import EmptyState from '../../shared/EmptyState';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const BannerGrid = ({ searchText, refreshKey, onEdit }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, [refreshKey, searchText, currentPage, pageSize]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { token, TokenId, userId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.GET_LIST}`,
        {
          Token: token || TokenId,
          draw: currentPage,
          start: (currentPage - 1) * pageSize,
          length: pageSize,
          UserId: userId,
          SearchText: searchText || '',
        }
      );
      const result = res.data;
      if (result && Array.isArray(result.data)) {
        setBanners(result.data);
        setTotalRecords(result.recordsTotal || 0);
      } else {
        setBanners([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Failed to fetch banners', err);
      message.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (banner) => {
    try {
      const { token, TokenId, userId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.UPDATE_BY_MODE}`,
        {
          Token: token || TokenId,
          LoggedUserId: String(userId || ''),
          Details: JSON.stringify({ UserId: String(userId || ''), Id: banner.BannerId || banner.Id, mode: 'D', JsonSetting: '' }),
        }
      );
      if (res.data?.Status === 1 || res.data?.Status === true) {
        message.success('Banner deleted successfully');
        fetchBanners();
      } else {
        message.error(res.data?.Message || 'Failed to delete banner');
      }
    } catch (err) {
      console.error('Failed to delete banner', err);
      message.error('Failed to delete banner');
    }
    setOpenDropdownId(null);
  };

  const buildBannerJsonSetting = (banner, overrides = {}) => {
    return JSON.stringify({
      Id: banner.BannerId || banner.Id || 0,
      BannerName: banner.BannerName || '',
      Content: banner.BannerText || banner.Content || '',
      BannerType: banner.BannerType || '',
      BannerBg: banner.BackgroundColor || banner.BannerBg || '',
      DismissOption: overrides.DismissOption !== undefined ? overrides.DismissOption : (banner.IsDismissable === 1 || banner.IsDismissable === true),
      IsActive: overrides.IsActive !== undefined ? overrides.IsActive : (banner.IsActive === 1 || banner.IsActive === true),
      BannerBehaviour: banner.BannerBehaviour || (banner.IsAlwaysShow ? 'showalltime' : 'disappearafter'),
      Disappearafter: banner.DisappearTimer || banner.Disappearafter || '',
      DisappearafterUnit: banner.TimerUnit || banner.DisappearafterUnit || '',
      DisplayTimer: banner.DisplayTimer === 1 || banner.DisplayTimer === true,
    });
  };

  const handleToggleStatus = async (banner) => {
    try {
      const { token, TokenId, userId } = getSession();
      const currentActive = banner.IsActive === 1 || banner.IsActive === true || banner.IsActive === '1';
      const newIsActive = !currentActive;
      const jsonSetting = buildBannerJsonSetting(banner, { IsActive: newIsActive });
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.UPDATE_BY_MODE}`,
        {
          Token: token || TokenId,
          LoggedUserId: String(userId || ''),
          Details: JSON.stringify({ UserId: String(userId || ''), Id: banner.BannerId || banner.Id, mode: 'Status', JsonSetting: jsonSetting }),
        }
      );
      if (res.data?.Status === 1 || res.data?.Status === true) {
        message.success(currentActive ? 'Banner deactivated' : 'Banner activated');
        fetchBanners();
      } else {
        message.error(res.data?.Message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      message.error('Failed to update status');
    }
    setOpenDropdownId(null);
  };

  const handleToggleDismissable = async (banner) => {
    try {
      const { token, TokenId, userId } = getSession();
      const currentDismissable = banner.IsDismissable === 1 || banner.IsDismissable === true || banner.IsDismissable === '1';
      const newIsDismissable = !currentDismissable;
      const jsonSetting = buildBannerJsonSetting(banner, { DismissOption: newIsDismissable });
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.UPDATE_BY_MODE}`,
        {
          Token: token || TokenId,
          LoggedUserId: String(userId || ''),
          Details: JSON.stringify({ UserId: String(userId || ''), Id: banner.BannerId || banner.Id, mode: 'dismissable', JsonSetting: jsonSetting }),
        }
      );
      if (res.data?.Status === 1 || res.data?.Status === true) {
        message.success(currentDismissable ? 'Banner is not dismissable' : 'Banner is dismissable');
        fetchBanners();
      } else {
        message.error(res.data?.Message || 'Failed to update dismissable');
      }
    } catch (err) {
      console.error('Failed to update dismissable', err);
      message.error('Failed to update dismissable');
    }
    setOpenDropdownId(null);
  };

  const handleClone = (banner) => {
    onEdit({ ...banner, isClone: true });
    setOpenDropdownId(null);
  };

  const columns = [
    {
      title: 'ACTION',
      dataIndex: 'BannerId',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <div className="action-dropdown" ref={dropdownRef}>
          <button
            className="action-trigger"
            onClick={() => setOpenDropdownId(openDropdownId === record.BannerId ? null : record.BannerId)}
          >
            <MoreVertical size={16} />
          </button>
          {openDropdownId === record.BannerId && (
            <div className="action-menu">
              <button
                className="action-menu-item edit"
                onClick={() => onEdit(record)}
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                className="action-menu-item clone"
                onClick={() => handleClone(record)}
              >
                <Copy size={14} />
                Clone
              </button>
              <button
                className="action-menu-item delete"
                onClick={() => handleDelete(record)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'NAME',
      dataIndex: 'BannerName',
      key: 'BannerName',
      sorter: (a, b) => (a.BannerName || '').localeCompare(b.BannerName || ''),
      render: (text, record) => (
        <span className="cell-name">
          {record.IsActive === 1 ? (
            <span className="cell-name-icon">&#9679;</span>
          ) : (
            <span className="cell-name-icon inactive">&#9679;</span>
          )}
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'TEXT',
      dataIndex: 'BannerText',
      key: 'BannerText',
      ellipsis: true,
      render: (text) => (
        <span className="cell-text">{text || '-'}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'IsActive',
      key: 'IsActive',
      width: 80,
      render: (value, record) => (
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value === 1 || value === true || value === '1'}
            onChange={() => handleToggleStatus(record)}
          />
          <span className="toggle-slider" />
        </label>
      ),
    },
    {
      title: 'DISMISSABLE',
      dataIndex: 'IsDismissable',
      key: 'IsDismissable',
      width: 100,
      render: (value, record) => (
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value === 1 || value === true || value === '1'}
            onChange={() => handleToggleDismissable(record)}
          />
          <span className="toggle-slider" />
        </label>
      ),
    },
  ];

  return (
    <div className="partner-table-container">
      <Table
        columns={columns}
        dataSource={banners}
        rowKey={(record) => record.BannerId || record.key}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} banners`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        locale={{ emptyText: <EmptyState message="No banners found." /> }}
      />
    </div>
  );
};

export default BannerGrid;

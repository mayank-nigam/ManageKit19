import React, { useState, useEffect, useCallback } from 'react';
import { Table, Dropdown, Tooltip } from 'antd';
import { User, Calendar, Eye, History, MoreVertical } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';
import EmptyState from '../../shared/EmptyState';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const VerifyKYCGrid = ({ filters, refreshKey, onView, onHistory }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.VERIFY_KYC.GET_LIST}`, {
        Token: token || TokenId,
        UserId: String(userId || ''),
        SearchText: filters.searchText || '',
        Status: filters.status || '0',
        FromDate: filters.fromDate || '',
        ToDate: filters.toDate || '',
        start: (pagination.current - 1) * pagination.pageSize,
        length: pagination.pageSize,
      });

      const result = res.data;
      const rows = result?.data || [];
      const total = result?.recordsTotal || rows.length;

      setData(rows.map((item, index) => ({ ...item, key: item.Id || index })));
      setPagination((prev) => ({ ...prev, total }));
    } catch (err) {
      console.error('Failed to fetch KYC list:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pag) => {
    setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const getStatusClass = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    if (s === 'submitted') return 'submitted';
    return 'pending';
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'ParentUserLogin',
      key: 'ParentUserLogin',
      width: '15%',
      render: (text) => (
        <span className="cell-user">
          <User size={14} className="cell-user-icon" />
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Document Count',
      key: 'DocumentCount',
      width: '18%',
      render: (_, record) => (
        <div className="doc-count-row">
          <span className="doc-count-badge approved">Approved {record.ApprovedCount || 0}</span>
          <span className="doc-count-badge rejected">Rejected {record.RejectedCount || 0}</span>
          <span className="doc-count-badge pending">Pending {record.PendingCount || 0}</span>
        </div>
      ),
    },
    {
      title: 'Created On',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: '15%',
      render: (text) => (
        <span className="cell-date">
          <Calendar size={13} className="cell-date-icon" />
          {formatDateToDDMmmYYYY(text) || '-'}
        </span>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'CreatedBy',
      key: 'CreatedBy',
      width: '12%',
      render: (text) => <span className="cell-text">{text || '-'}</span>,
    },
    {
      title: 'Modified On',
      dataIndex: 'ModifiedOn',
      key: 'ModifiedOn',
      width: '15%',
      render: (text) => (
        <span className="cell-date">
          <Calendar size={13} className="cell-date-icon" />
          {formatDateToDDMmmYYYY(text) || '-'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      width: '12%',
      render: (text) => (
        <span className={`status-badge ${getStatusClass(text)}`}>
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      width: '8%',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <Eye size={14} />,
                label: 'View',
                className: 'action-menu-item view',
                onClick: () => onView(record),
              },
              {
                key: 'history',
                icon: <History size={14} />,
                label: 'History',
                className: 'action-menu-item history',
                onClick: () => onHistory(record),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="action-trigger">
            <MoreVertical size={16} />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="partner-table-container">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total} entries`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: <EmptyState message="No KYC records found." />,
        }}
        size="middle"
      />
    </div>
  );
};

export default VerifyKYCGrid;

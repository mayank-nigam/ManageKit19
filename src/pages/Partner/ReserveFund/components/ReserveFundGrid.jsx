import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tooltip } from 'antd';
import { Lock, Unlock, Settings, Eye, ArrowDownUp } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import EmptyState from '../../shared/EmptyState';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const ReserveFundGrid = ({ searchUserId, onManageFund, onViewTransaction, refreshKey, onStatsUpdate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.RESERVE_FUND.GET_BY_USER_ID}`, {
        Token: token || TokenId,
        UserId: String(userId || ''),
        LoggedUserId: String(userId || ''),
        SearchText: '',
        UserIds: searchUserId || String(userId || ''),
        start: (pagination.current - 1) * pagination.pageSize,
        length: pagination.pageSize,
      });

      const result = res.data;
      const rows = result?.data || [];
      const total = result?.recordsTotal || rows.length;

      if (rows.length > 0 && onStatsUpdate) {
        onStatsUpdate({
          totalMoney: rows[0].TotalMoney || 0,
          totalReservedFunds: rows[0].TotalReservedFunds || 0,
          totalUnreservedFunds: rows[0].TotalUnreservedFunds || 0,
        });
      }

      setData(rows.map((item, index) => ({ ...item, key: item.Id || index })));
      setPagination((prev) => ({ ...prev, total }));
    } catch (err) {
      console.error('Failed to fetch reserve fund list:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchUserId, pagination.current, pagination.pageSize, refreshKey, onStatsUpdate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pag) => {
    setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'ServiceName',
      key: 'ServiceName',
      width: '30%',
      render: (text) => (
        <span className="cell-service">
          <Settings size={15} className="cell-service-icon" />
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Reserved Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      width: '35%',
      render: (amount, record) => (
        <div className="cell-amount-wrapper">
          {record.IsLock ? (
            <Tooltip title="Reserved Amount">
              <Lock size={15} className="cell-lock-icon" />
            </Tooltip>
          ) : (
            <Tooltip title="Available Amount">
              <Unlock size={15} className="cell-unlock-icon" />
            </Tooltip>
          )}
          <span
            className="cell-amount"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => onManageFund(record, 'manage')}
          >
            {amount || 0}
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '35%',
      render: (_, record) => (
        <div className="cell-actions">
          <Tooltip title="View Transaction">
            <button
              className="action-btn view"
              onClick={() => onViewTransaction(record)}
            >
              <Eye size={15} />
            </button>
          </Tooltip>
          <Tooltip title="Release Fund">
            <button
              className="action-btn release"
              onClick={() => onManageFund(record, 'release')}
            >
              <ArrowDownUp size={15} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="partner-table-container" style={{ padding: '0' }}>
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
          emptyText: <EmptyState message="No reserve fund records found." />,
        }}
        size="middle"
      />
    </div>
  );
};

export default ReserveFundGrid;

import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import { Calendar, Settings, User } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import EmptyState from '../../shared/EmptyState';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const AuditLogGrid = ({ searchUserId, refreshKey }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.RESERVE_FUND.GET_AUDIT_LOG}`, {
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

      setData(rows.map((item, index) => ({ ...item, key: item.Id || index })));
      setPagination((prev) => ({ ...prev, total }));
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchUserId, pagination.current, pagination.pageSize, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pag) => {
    setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'CreatedDate',
      key: 'CreatedDate',
      width: '20%',
      render: (text) => (
        <span className="cell-datetime">
          <Calendar size={14} className="cell-datetime-icon" />
          {formatDateToDDMmmYYYY(text) || '-'}
        </span>
      ),
    },
    {
      title: 'Service Name',
      dataIndex: 'ServiceName',
      key: 'ServiceName',
      width: '18%',
      render: (text) => (
        <span className="cell-service">
          <Settings size={14} className="cell-service-icon" />
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'StartAmount',
      key: 'StartAmount',
      width: '14%',
      render: (amount) => (
        <span className="cell-amount">{amount || 0}</span>
      ),
    },
    {
      title: 'Reserve/Release',
      key: 'CreditDebit',
      width: '16%',
      render: (_, record) => {
        const value = record.Credit || record.Debit;
        const isCredit = record.Credit && !record.Debit;
        return (
          <span className={isCredit ? 'cell-credit' : 'cell-debit'}>
            {isCredit ? '+' : '-'}{value || 0}
          </span>
        );
      },
    },
    {
      title: 'Balance',
      dataIndex: 'Amount',
      key: 'Amount',
      width: '14%',
      render: (amount) => (
        <span className="cell-balance">{amount || 0}</span>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'UserName',
      key: 'UserName',
      width: '18%',
      render: (text) => (
        <span className="cell-user">
          <User size={13} />
          {text || '-'}
        </span>
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
          emptyText: <EmptyState message="No audit log records found." />,
        }}
        size="middle"
      />
    </div>
  );
};

export default AuditLogGrid;

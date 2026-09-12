import React from 'react';
import { Table, Tooltip } from 'antd';
import { Calendar, User, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';
import EmptyState from '../../shared/EmptyState';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const formattedDate = formatDateToDDMmmYYYY(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formattedDate} ${hours}:${minutes}:${seconds}`;
};

const LicenceGrid = ({ data, loading }) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: 180,
      sorter: (a, b) => (a.CreatedOn || '').localeCompare(b.CreatedOn || ''),
      render: (val) => (
        <span className="cell-date">
          <Calendar size={13} className="cell-date-icon" />
          {formatDate(val)}
        </span>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'CreatedByName',
      key: 'CreatedByName',
      width: 140,
      sorter: (a, b) => (a.CreatedByName || '').localeCompare(b.CreatedByName || ''),
      render: (val) => (
        <span className="cell-text">
          <User size={13} className="cell-text-icon" />
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'From User',
      dataIndex: 'FromUserName',
      key: 'FromUserName',
      width: 140,
      sorter: (a, b) => (a.FromUserName || '').localeCompare(b.FromUserName || ''),
      render: (val) => (
        <span className="cell-user from-user">
          <ArrowLeft size={12} />
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'To User',
      dataIndex: 'ToUserName',
      key: 'ToUserName',
      width: 140,
      sorter: (a, b) => (a.ToUserName || '').localeCompare(b.ToUserName || ''),
      render: (val) => (
        <span className="cell-user to-user">
          <ArrowRight size={12} />
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'Credit',
      dataIndex: 'Credit',
      key: 'Credit',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.Credit || 0) - (b.Credit || 0),
      render: (val) => (
        <span className={`cell-amount ${val > 0 ? 'credit' : ''}`}>
          {val > 0 ? `+${val}` : val || '0'}
        </span>
      ),
    },
    {
      title: 'Debit',
      dataIndex: 'Debit',
      key: 'Debit',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.Debit || 0) - (b.Debit || 0),
      render: (val) => (
        <span className={`cell-amount ${val > 0 ? 'debit' : ''}`}>
          {val > 0 ? `-${val}` : val || '0'}
        </span>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'Balance',
      key: 'Balance',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.Balance || 0) - (b.Balance || 0),
      render: (val) => (
        <span className="cell-balance">{val || '0'}</span>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'Remarks',
      key: 'Remarks',
      width: 350,
      sorter: (a, b) => (a.Remarks || '').localeCompare(b.Remarks || ''),
      render: (val) => (
        <Tooltip title={val}>
          <span className="cell-remarks" style={{ whiteSpace: 'normal', wordWrap: 'break-word', display: 'block', maxWidth: '300px' }}>
            <MessageSquare size={12} className="cell-remarks-icon" />
            {val || '—'}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="partner-table-container">
      <Table
        rowKey={(record, index) => index}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => <span className="total-record">Total {total} records</span>,
        }}
        scroll={{ x: 1100 }}
        locale={{
          emptyText: <EmptyState message="No transactions found." />,
        }}
      />
    </div>
  );
};

export default LicenceGrid;

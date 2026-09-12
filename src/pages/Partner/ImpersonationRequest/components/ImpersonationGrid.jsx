import React from 'react';
import { Table, Dropdown, Tooltip } from 'antd';
import { Calendar, User, CheckCircle, XCircle, MoreVertical, Clock, MessageSquare } from 'lucide-react';
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

const STATUS_CONFIG = {
  Requested: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', icon: Clock },
  Approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', icon: CheckCircle },
  Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Requested;
  const Icon = config.icon;
  return (
    <span
      className="status-badge"
      style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

const ImpersonationGrid = ({ data, loading, onApproveReject }) => {
  const columns = [
    {
      title: 'Request Date',
      dataIndex: 'RequestedDate',
      key: 'RequestedDate',
      width: 180,
      sorter: (a, b) => (a.RequestedDate || '').localeCompare(b.RequestedDate || ''),
      render: (val) => (
        <span className="cell-date">
          <Calendar size={13} className="cell-icon" />
          {formatDate(val)}
        </span>
      ),
    },
    {
      title: 'From Partner',
      dataIndex: 'RequestedbyUser',
      key: 'RequestedbyUser',
      width: 160,
      sorter: (a, b) => (a.RequestedbyUser || '').localeCompare(b.RequestedbyUser || ''),
      render: (val) => (
        <span className="cell-user">
          <User size={13} className="cell-icon" />
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'RequestedForUser',
      key: 'RequestedForUser',
      width: 160,
      sorter: (a, b) => (a.RequestedForUser || '').localeCompare(b.RequestedForUser || ''),
      render: (val) => (
        <span className="cell-user">
          <User size={13} className="cell-icon" />
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      width: 220,
      sorter: (a, b) => (a.REQUESTPERIODFROM || '').localeCompare(b.REQUESTPERIODFROM || ''),
      render: (_, record) => (
        <div className="cell-period">
          <span className="period-from">{formatDate(record.REQUESTPERIODFROM)}</span>
          <span className="period-separator">—</span>
          <span className="period-to">{formatDate(record.REQUESTPERIODTO)}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      width: 120,
      sorter: (a, b) => (a.Status || '').localeCompare(b.Status || ''),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Remarks',
      dataIndex: 'Remarks',
      key: 'Remarks',
      width: 200,
      sorter: (a, b) => (a.Remarks || '').localeCompare(b.Remarks || ''),
      render: (val) => (
        <Tooltip title={val}>
          <span className="cell-remarks">
            <MessageSquare size={12} className="cell-icon" />
            {val || '—'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      sorter: false,
      render: (_, record) => {
        if (record.Status !== 'Requested') return null;
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'approve',
                  label: 'Approve',
                  icon: <CheckCircle size={13} />,
                  onClick: () => onApproveReject(record.RecID, 'approve'),
                },
                {
                  key: 'reject',
                  label: 'Reject',
                  icon: <XCircle size={13} />,
                  danger: true,
                  onClick: () => onApproveReject(record.RecID, 'reject'),
                },
              ],
            }}
            trigger={['click']}
          >
            <button type="button" className="action-btn">
              <MoreVertical size={16} />
            </button>
          </Dropdown>
        );
      },
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
          pageSize: 100,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => <span className="total-record">Total {total} records</span>,
        }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: <EmptyState message="No requests found." />,
        }}
      />
    </div>
  );
};

export default ImpersonationGrid;

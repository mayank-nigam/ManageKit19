import React from 'react';
import { Table, Switch, Dropdown, Tooltip } from 'antd';
import {
  Phone, Mail as MailIcon, MessageSquare, Wallet, MoreVertical,
  Crown, BadgeCheck, ChevronDown,
} from 'lucide-react';
import { formatCompactNumber } from '../utils/formatCompactNumber';
import { formatDateToDDMmmYYYY } from '../utils/formatDate';
import { confirmStatusOff } from './StatusToggleConfirm';
import { canPerform } from '../utils/permissionGate';
import { PARTNER_TYPE_LABEL } from '../mockData/mockUsers';
import EmptyState from '../../shared/EmptyState';

const GRADIENTS = [
  ['#6366f1', '#8b5cf6'],
  ['#0ea5e9', '#22d3ee'],
  ['#f97316', '#f59e0b'],
  ['#10b981', '#22c55e'],
  ['#ec4899', '#f43f5e'],
];

function gradientFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initialsFor(name) {
  const parts = name.replace(/\(.*\)/, '').trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

const PARTNER_BADGE_COLOR = {
  1: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }, // Bronze
  2: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }, // Silver
  3: { bg: '#fef9c3', text: '#a16207', border: '#fde047' }, // Gold
};

const Avatar = ({ user }) => {
  const [from, to] = gradientFor(user.name);
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ width: 36, height: 36, fontSize: 13, background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initialsFor(user.name).toUpperCase() || '?'}
    </div>
  );
};

const BalanceChip = ({ icon, value, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="balance-chip"
  >
    {icon}
    {formatCompactNumber(value)}
  </button>
);

const UserGrid = ({
  users,
  loading,
  pagination,
  onTableChange,
  onOpenCredit,
  onOpenUpdateSubscription,
  onOpenAssignUser,
  onOpenSnapshot,
  onOpenUpgradeUser,
  onOpenChangePartner,
  onOpenCallWidget,
  onOpenSendSms,
  onToggleStatus,
  permissions,
  selectedRowKeys,
  onSelectionChange,
}) => {
  const handleStatusChange = async (checked, user) => {
    if (!checked) {
      const confirmed = await confirmStatusOff(user.name);
      if (!confirmed) return;
    }
    onToggleStatus(user, checked ? 1 : 0);
  };

  const menuItemsFor = (user) => {
    const items = [];
    const isGoldPartner = user.partnerType === 3;
    const isPartner = user.userType === 4;

    if (canPerform('subscription.update', permissions)) {
      items.push({ key: 'update-subscription', label: 'Update Subscription' });
    }
    if (canPerform('snapshot.create', permissions)) {
      items.push({ key: 'create-snapshot', label: 'Create Snapshot' });
    }
    // Upgrade User: only show if not a Gold Partner (Gold is the highest tier)
    if (canPerform('user.upgrade', permissions) && !(isGoldPartner && isPartner)) {
      items.push({ key: 'upgrade-user', label: 'Upgrade User' });
    }
    if (canPerform('partner.change', permissions)) {
      items.push({ key: 'change-partner', label: 'Change partner' });
    }
    if (canPerform('assign-user', permissions)) {
      items.push({ key: 'assign-user', label: 'Assign user' });
    }
    return items;
  };

  const handleMenuClick = (key, user) => {
    if (key === 'update-subscription') onOpenUpdateSubscription(user);
    if (key === 'create-snapshot') onOpenSnapshot(user);
    if (key === 'upgrade-user') onOpenUpgradeUser(user);
    if (key === 'change-partner') onOpenChangePartner(user);
    if (key === 'assign-user') onOpenAssignUser(user);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-gray-900 truncate">{user.name}</span>
              {user.isWhiteLabeled && (
                <Crown size={14} className="text-amber-500 shrink-0" title="White Labeled Partner" />
              )}
              {user.isDomainVerified && (
                <BadgeCheck size={14} className="text-blue-500 shrink-0" title="Domain Verified" />
              )}
            </div>
            {user.partnerType && (
              <span
                className="partner-badge"
                style={{
                  background: PARTNER_BADGE_COLOR[user.partnerType]?.bg,
                  color: PARTNER_BADGE_COLOR[user.partnerType]?.text,
                  border: `1px solid ${PARTNER_BADGE_COLOR[user.partnerType]?.border}`,
                }}
              >
                {PARTNER_TYPE_LABEL[user.partnerType]}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile',
      key: 'mobile',
      width: 200,
      sorter: (a, b) => (a.mobile?.number || '').localeCompare(b.mobile?.number || ''),
      render: (_, user) => (
        <div className="inline-flex items-center gap-1 text-gray-600 text-sm">
          <Tooltip title="Call will connect through the Kit19 gateway.">
            <button
              type="button"
              onClick={() => onOpenCallWidget(user)}
              className="call-btn"
              aria-label="Click to call"
            >
              <Phone size={14} />
            </button>
          </Tooltip>
          <Dropdown
            menu={{
              items: [{ key: 'sms', label: 'SMS', icon: <MessageSquare size={13} /> }],
              onClick: () => onOpenSendSms(user),
            }}
            trigger={['click']}
          >
            <button type="button" className="sms-dropdown-btn" aria-label="Mobile actions">
              <ChevronDown size={12} />
            </button>
          </Dropdown>
          <span>{user.mobile.countryFlagIso} {user.mobile.number}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      render: (email) => (
        <span className="inline-flex items-center gap-1.5 text-gray-600 text-sm truncate">
          <MailIcon size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{email}</span>
        </span>
      ),
    },
    {
      title: 'User',
      key: 'userCount',
      width: 70,
      sorter: (a, b) => (a.allowUserCount || a.totalActiveUser || 0) - (b.allowUserCount || b.totalActiveUser || 0),
      render: (_, user) => (
        <span className="text-sm text-gray-700 font-medium">
          {user.allowUserCount > 0 ? user.allowUserCount : user.totalActiveUser}
        </span>
      ),
    },
    {
      title: 'Subscription',
      key: 'subscription',
      width: 260,
      sorter: (a, b) => (a.subscription?.endDate || '').localeCompare(b.subscription?.endDate || ''),
      render: (_, user) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDateToDDMmmYYYY(user.subscription.startDate)} — {formatDateToDDMmmYYYY(user.subscription.endDate)}
        </span>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 170,
      sorter: (a, b) => (a.assignedTo || '').localeCompare(b.assignedTo || ''),
      render: (val) => <span className="text-sm text-gray-600">{val || '—'}</span>,
    },
    {
      title: 'SMS',
      key: 'sms',
      width: 90,
      sorter: (a, b) => (a.smsBalance || 0) - (b.smsBalance || 0),
      render: (_, user) => (
        <BalanceChip
          icon={<MessageSquare size={13} className="text-emerald-500" />}
          value={user.smsBalance}
          title="Add SMS Credit"
          onClick={() => onOpenCredit(user, 'sms')}
        />
      ),
    },
    {
      title: 'Mail',
      key: 'mail',
      width: 90,
      sorter: (a, b) => (a.mailBalance || 0) - (b.mailBalance || 0),
      render: (_, user) => (
        <BalanceChip
          icon={<MailIcon size={13} className="text-sky-500" />}
          value={user.mailBalance}
          title="Add Mail Credit"
          onClick={() => onOpenCredit(user, 'mail')}
        />
      ),
    },
    {
      title: 'Wallet',
      key: 'wallet',
      width: 90,
      sorter: (a, b) => (a.walletBalance || 0) - (b.walletBalance || 0),
      render: (_, user) => (
        <BalanceChip
          icon={<Wallet size={13} className="text-violet-500" />}
          value={user.walletBalance}
          title="Add Wallet Money"
          onClick={() => onOpenCredit(user, 'wallet')}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 80,
      sorter: (a, b) => (a.status || 0) - (b.status || 0),
      render: (_, user) => (
        <Switch
          checked={user.status === 1}
          onChange={(checked) => handleStatusChange(checked, user)}
          className={user.status === 1 ? 'bg-green-500' : 'bg-gray-300'}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      fixed: 'right',
      sorter: false,
      render: (_, user) => {
        const items = menuItemsFor(user);
        if (items.length === 0) return null;
        return (
          <Dropdown
            menu={{ items, onClick: ({ key }) => handleMenuClick(key, user) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="action-menu-btn"
              aria-label="Row actions"
            >
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
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          ...pagination,
          showTotal: (total) => <span className="total-record">Total {total} records</span>,
        }}
        onChange={onTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectionChange,
        }}
        scroll={{ x: 1400 }}
        locale={{
          emptyText: <EmptyState message="No users found." />,
        }}
      />
    </div>
  );
};

export default UserGrid;

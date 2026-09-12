import React, { useState } from 'react';
import { Table, Switch } from 'antd';
import { Eye, Pencil, ArrowUpRight, Layers } from 'lucide-react';
import { canPerform } from '../utils/permissionGate';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';
import EmptyState from '../../shared/EmptyState';

const ICON_THEMES = [
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-teal-50', text: 'text-teal-600' },
  { bg: 'bg-pink-50', text: 'text-pink-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
];

function themeFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ICON_THEMES[Math.abs(hash) % ICON_THEMES.length];
}

const StatusPill = ({ status }) => (
  <span
    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
      status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}
  >
    {status}
  </span>
);

// Two independent controls live in one "Count" cell, matching the legacy page's split
// between .btnShowRecord (view count inline, no navigation) and .btnShowOnManageUser
// (a separate click target that jumps to Manage User) - GR-11. The count is fetched
// lazily on first click, same as legacy, rather than pre-loaded for every row.
const CountCell = ({ segment, onViewCount, onNavigate, permissions }) => {
  const [revealed, setRevealed] = useState(false);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    if (!canPerform('segment.viewCount', permissions)) return;
    setLoading(true);
    const c = await onViewCount(segment.id);
    setLoading(false);
    setCount(c);
    setRevealed(true);
  };

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={handleView}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        <Eye size={14} />
        {loading ? 'Loading…' : 'View Count'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate(segment)}
      title="Open in Manage User"
      className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
    >
      {count}
      <ArrowUpRight size={13} />
    </button>
  );
};

const SegmentGrid = ({ segments, loading, pagination, onTableChange, onToggleStatus, onEdit, onViewCount, onNavigateToManageUser, permissions }) => {
  const columns = [
    {
      title: 'Search Name',
      key: 'name',
      render: (_, segment) => {
        const theme = themeFor(segment.name);
        const conditionCount = segment.conditions?.length || 0;
        return (
          <button
            type="button"
            onClick={() => canPerform('segment.edit', permissions) && onEdit(segment)}
            className="inline-flex items-center gap-3 text-left group"
          >
            <span className={`w-9 h-9 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}>
              <Layers size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-gray-900 group-hover:text-green-700">{segment.name}</span>
              <span className="block text-xs text-gray-400">
                {conditionCount} condition{conditionCount === 1 ? '' : 's'} · {segment.logicalOperator === 'or' ? 'Any' : 'All'} match
              </span>
            </span>
          </button>
        );
      },
    },
    {
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 140,
      render: (val) => <span className="text-sm text-gray-600">{formatDateToDDMmmYYYY(val)}</span>,
    },
    {
      title: 'Created By',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: 160,
      render: (val) => <span className="text-sm text-gray-600">{val}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, segment) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={segment.status === 'Active'}
            onChange={(checked) => onToggleStatus(segment, checked ? 'Active' : 'Inactive')}
            className={segment.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}
          />
          <StatusPill status={segment.status} />
        </div>
      ),
    },
    {
      title: 'Count',
      key: 'count',
      width: 130,
      render: (_, segment) => (
        <CountCell segment={segment} onViewCount={onViewCount} onNavigate={onNavigateToManageUser} permissions={permissions} />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, segment) => (
        canPerform('segment.edit', permissions) && (
          <button
            type="button"
            onClick={() => onEdit(segment)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label="Edit segment"
          >
            <Pencil size={15} />
          </button>
        )
      ),
    },
  ];

  return (
    <div className="partner-table-container">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={segments}
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
        locale={{
          emptyText: <EmptyState message="No segments found." />,
        }}
      />
    </div>
  );
};

export default SegmentGrid;

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { Plus, Layers, CheckCircle2, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

import usePermissions from './usePermissions';
import { canPerform } from './utils/permissionGate';
import StatCard from '../shared/StatCard';
import RefreshButton from '../shared/RefreshButton';

import SegmentFilterBar from './components/SegmentFilterBar';
import SegmentGrid from './components/SegmentGrid';
import SegmentFormDrawer from './components/SegmentFormDrawer';

import {
  fetchSegments,
  toggleSegmentStatus,
  saveSegment,
  getRecordCount,
} from './mockData/mockSegmentApi';

import '../shared/PartnerCommon.css';

const UserSegmentation = () => {
  // TODO: replace with a real registered module code once the User Segmentation
  // module is registered in RolePermissionMapping/ModuleMaster.
  const { permissions } = usePermissions('PAG-USERSEGMENTATION-MOCK');

  const [segments, setSegments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    nameSearch: '',
    status: '',
    fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const [formOpen, setFormOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);

  const loadSegments = useCallback(async () => {
    setLoading(true);
    const res = await fetchSegments({ ...filters, page: pagination.current, pageSize: pagination.pageSize });
    if (res.Status === 1) {
      setSegments(res.Details.rows);
      setTotal(res.Details.total);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.nameSearch, filters.status, filters.fromDate, filters.toDate, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  // Name search preserves the current page (business rules GR-4: ajax.reload(null, false)).
  const handleSearch = (value) => {
    setFilters((f) => ({ ...f, nameSearch: value }));
  };

  const handleDateRangeChange = (fromDate, toDate) => {
    setFilters((f) => ({ ...f, fromDate, toDate }));
  };

  const handleStatusChange = (status) => {
    setFilters((f) => ({ ...f, status }));
  };

  const handleTableChange = (paginationConfig) => {
    setPagination({ current: paginationConfig.current, pageSize: paginationConfig.pageSize });
  };

  const handleToggleStatus = async (segment, status) => {
    const res = await toggleSegmentStatus(segment.id, status);
    if (res.Status === 1) {
      // Unlike the legacy page (business rules ST-4/B-14, which resets to page 1 on
      // this one action while every other reload here preserves the page), the row
      // is patched in place - no reload, no pagination side-effect at all.
      setSegments((prev) => prev.map((s) => (s.id === segment.id ? res.Details : s)));
    } else {
      Swal.fire('Error', res.Message || 'Unable to update status.', 'error');
    }
  };

  const handleViewCount = async (id) => {
    if (!canPerform('segment.viewCount', permissions)) return null;
    const res = await getRecordCount(id);
    return res.Status === 1 ? res.Details.count : 0;
  };

  const handleNavigateToManageUser = (segment) => {
    if (!canPerform('segment.showOnManageUser', permissions)) return;
    // Legacy deep-links via an encrypted `sid` query param, opened in a new tab
    // (MU-1) so the partner can keep this segment list open while checking counts
    // across several segments. This mock build uses the plain segment id instead of
    // an encrypted one - ManageUser.jsx reads it on mount to pre-filter its Segment
    // dropdown (GR-3).
    window.open(`/partner/manage-user?segmentId=${segment.id}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveSegment = async (payload) => {
    const res = await saveSegment(payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: payload.id ? 'Segment updated' : 'Segment created', timer: 1500, showConfirmButton: false });
      loadSegments();
    }
    return res;
  };

  const activeCount = segments.filter((s) => s.status === 'Active').length;
  const inactiveCount = segments.filter((s) => s.status === 'Inactive').length;

  return (
    <div className="user-segmentation-container p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">User Segmentation</h1>
          <p className="text-sm text-gray-500 mt-1">Build reusable audience segments over your user records.</p>
        </div>
        {canPerform('segment.add', permissions) && (
          <Button
            type="primary"
            icon={<Plus size={15} />}
            className="bg-green-600 hover:bg-green-700 border-green-600"
            onClick={() => { setActiveSegment(null); setFormOpen(true); }}
          >
            Add Segment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Layers size={18} />}
          label="Total (this page)"
          value={total}
          subtitle={`${activeCount} active · ${inactiveCount} inactive`}
          color="blue"
        />
        <StatCard icon={<CheckCircle2 size={18} />} label="Active (this page)" value={activeCount} color="green" />
        <StatCard icon={<XCircle size={18} />} label="Inactive (this page)" value={inactiveCount} color="rose" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SegmentFilterBar
            filters={filters}
            onSearch={handleSearch}
            onDateRangeChange={handleDateRangeChange}
            onStatusChange={handleStatusChange}
          />
        </div>
        <RefreshButton onRefresh={loadSegments} title="Refresh list" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <SegmentGrid
          segments={segments}
          loading={loading}
          pagination={{ ...pagination, total, showSizeChanger: true }}
          onTableChange={handleTableChange}
          onToggleStatus={handleToggleStatus}
          onEdit={(segment) => { setActiveSegment(segment); setFormOpen(true); }}
          onViewCount={handleViewCount}
          onNavigateToManageUser={handleNavigateToManageUser}
          permissions={permissions}
        />
      </div>

      <SegmentFormDrawer
        open={formOpen}
        segment={activeSegment}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveSegment}
      />
    </div>
  );
};

export default UserSegmentation;

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { UserPlus, Download, Users, UserCheck, Shield, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import usePermissions from './usePermissions';
import { canPerform } from './utils/permissionGate';
import { formatCompactNumber } from './utils/formatCompactNumber';
import { formatDateToDDMmmYYYY } from './utils/formatDate';
import { mockTeamMembers } from './mockData/mockUsers';
import StatCard from '../shared/StatCard';
import RefreshButton from '../shared/RefreshButton';

import FilterBar from './components/FilterBar';
import BulkAssignBar from './components/BulkAssignBar';
import UserGrid from './components/UserGrid';
import AddUserWizard from './components/AddUserWizard';
import UpdateSubscriptionDrawer from './components/UpdateSubscriptionDrawer';
import CreditDrawer from './components/CreditDrawer';
import AssignUserModal from './components/AssignUserModal';
import SnapshotDrawer from './components/SnapshotDrawer';
import UpgradeUserDrawer from './components/UpgradeUserDrawer';
import ChangePartnerDrawer from './components/ChangePartnerDrawer';
import CallWidget from './components/CallWidget';
import SendSmsDrawer from './components/SendSmsDrawer';

import {
  fetchUsers,
  toggleUserStatus,
  updateSubscription,
  assignUser,
  addCredit,
  addUser,
  exportUsers,
  createSnapshot,
  upgradeUser,
  changePartnerRequest,
  bulkAssignTeam,
  sendSms,
} from './mockData/mockUserApi';

import '../shared/PartnerCommon.css';
import './ManageUser.css';

const ManageUser = () => {
  // TODO: replace with a real registered module code once the Manage User module
  // exists in RolePermissionMapping/ModuleMaster on the backend.
  const { permissions } = usePermissions('PAG-MANAGEUSER-MOCK');

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  // Deep-link integration with User Segmentation's "Show on Manage User" action
  // (business rules MU-1/GR-3): the legacy page reads an encrypted `sid`; this mock
  // build uses a plain `segmentId` query param instead since there's no real
  // encryption layer here yet.
  const [filters, setFilters] = useState(() => {
    const segmentIdParam = searchParams.get('segmentId');
    return { nameSearch: '', userType: 0, partnerType: null, segmentId: segmentIdParam ? Number(segmentIdParam) : null };
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [updateSubOpen, setUpdateSubOpen] = useState(false);
  const [activeUserForSub, setActiveUserForSub] = useState(null);
  const [creditOpen, setCreditOpen] = useState(false);
  const [activeUserForCredit, setActiveUserForCredit] = useState(null);
  const [creditType, setCreditType] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeUserForAssign, setActiveUserForAssign] = useState(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [activeUserForSnapshot, setActiveUserForSnapshot] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activeUserForUpgrade, setActiveUserForUpgrade] = useState(null);
  const [changePartnerOpen, setChangePartnerOpen] = useState(false);
  const [activeUserForChangePartner, setActiveUserForChangePartner] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  const [activeCallUser, setActiveCallUser] = useState(null);
  const [sendSmsOpen, setSendSmsOpen] = useState(false);
  const [activeUserForSms, setActiveUserForSms] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetchUsers({
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    if (res.Status === 1) {
      setUsers(res.Details.rows);
      setTotal(res.Details.total);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.nameSearch, filters.userType, filters.partnerType, filters.segmentId, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Name search and Segment changes reset to page 1; UserType change preserves the
  // current page - implemented explicitly here (rather than inferred), matching the
  // legacy business rule intentionally instead of by accident.
  const handleNameSearch = (value) => {
    setFilters((f) => ({ ...f, nameSearch: value }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleSegmentChange = (segmentId) => {
    setFilters((f) => ({ ...f, segmentId }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleUserTypeChange = ({ userType, partnerType }) => {
    setFilters((f) => ({ ...f, userType, partnerType }));
  };

  const handleTableChange = (paginationConfig) => {
    setPagination({ current: paginationConfig.current, pageSize: paginationConfig.pageSize });
  };

  const handleToggleStatus = async (user, status) => {
    const res = await toggleUserStatus(user.id, status);
    if (res.Status === 1) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.Details : u)));
    } else {
      Swal.fire('Error', res.Message || 'Unable to update status.', 'error');
    }
  };

  const handleAddUser = async (payload) => {
    const res = await addUser(payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'User created successfully', timer: 1500, showConfirmButton: false });
      loadUsers();
    }
    return res;
  };

  const handleUpdateSubscription = async (userId, payload) => {
    const res = await updateSubscription(userId, payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'Subscription updated', timer: 1500, showConfirmButton: false });
      loadUsers();
    }
    return res;
  };

  const handleAssignUser = async (userId, teamMemberId, teamMemberName) => {
    const res = await assignUser(userId, teamMemberId, teamMemberName);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'User assigned', timer: 1500, showConfirmButton: false });
      loadUsers();
    }
    return res;
  };

  const handleCreateSnapshot = async (userId, payload) => {
    const res = await createSnapshot(userId, payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'Snapshot created', timer: 1500, showConfirmButton: false });
    }
    return res;
  };

  const handleUpgradeUser = async (userId, payload) => {
    const res = await upgradeUser(userId, payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'User upgraded', timer: 1500, showConfirmButton: false });
      loadUsers();
    }
    return res;
  };

  const handleChangePartnerRequest = async (userId, payload) => {
    const res = await changePartnerRequest(userId, payload);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'Request sent', timer: 1500, showConfirmButton: false });
    }
    return res;
  };

  const handleBulkAssignTeam = async (teamMemberId) => {
    const member = mockTeamMembers.find((m) => m.id === teamMemberId);
    setBulkAssigning(true);
    const res = await bulkAssignTeam(selectedRowKeys, teamMemberId, member?.name || '');
    setBulkAssigning(false);

    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: `${res.Details.count} user(s) assigned`, timer: 1500, showConfirmButton: false });
      setSelectedRowKeys([]);
      loadUsers();
    } else {
      Swal.fire('Error', res.Message || 'Unable to assign team.', 'error');
    }
  };

  const handleSendSms = async (userId, message) => sendSms(userId, message);

  const handleAddCredit = async (userId, type, amount) => {
    const res = await addCredit(userId, type, amount);
    if (res.Status === 1) {
      Swal.fire({ icon: 'success', title: 'Credit added', timer: 1500, showConfirmButton: false });
      loadUsers();
    }
    return res;
  };

  const handleExport = async () => {
    if (!canPerform('export', permissions)) return;
    const res = await exportUsers(filters);
    if (res.Status !== 1) return;

    const rows = res.Details.rows;
    const header = ['Name', 'Mobile', 'Email', 'Subscription End', 'Status'];
    const csvRows = rows.map((u) => [
      u.name,
      u.mobile.number,
      u.email,
      formatDateToDDMmmYYYY(u.subscription.endDate),
      u.status === 1 ? 'Active' : 'Inactive',
    ]);
    const csv = [header, ...csvRows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manage-user-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = users.filter((u) => u.status === 1).length;
  const inactiveCount = users.length - activeCount;
  const partnerCount = users.filter((u) => u.userType === 4).length;
  const walletTotal = users.reduce((sum, u) => sum + u.walletBalance, 0);

  return (
    <div className="manage-user-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Manage User</h1>
          <p className="page-subtitle">View and manage your partner sub-accounts, subscriptions and balances.</p>
        </div>
        <div className="page-header-actions">
          {canPerform('export', permissions) && (
            <Button icon={<Download size={15} />} onClick={handleExport} className="export-btn">
              Export
            </Button>
          )}
          {canPerform('add-user', permissions) && (
            <Button
              type="primary"
              icon={<UserPlus size={15} />}
              className="add-user-btn"
              onClick={() => setAddUserOpen(true)}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      <div className="stat-cards-grid">
        <StatCard
          icon={<Users size={18} />}
          label="Total (this page)"
          value={total}
          subtitle={`${activeCount} active · ${inactiveCount} inactive`}
          color="blue"
        />
        <StatCard icon={<UserCheck size={18} />} label="Active (this page)" value={activeCount} color="green" />
        <StatCard icon={<Shield size={18} />} label="Partners (this page)" value={partnerCount} color="purple" />
        <StatCard
          icon={<Wallet size={18} />}
          label="Wallet Total (this page)"
          value={formatCompactNumber(walletTotal)}
          color="amber"
        />
      </div>

      <div className="filter-card">
        <div className="filter-card-inner">
          {selectedRowKeys.length > 0 ? (
            <BulkAssignBar
              selectedCount={selectedRowKeys.length}
              onAssign={handleBulkAssignTeam}
              assigning={bulkAssigning}
            />
          ) : (
            <FilterBar
              filters={filters}
              onNameSearch={handleNameSearch}
              onSegmentChange={handleSegmentChange}
              onUserTypeChange={handleUserTypeChange}
            />
          )}
        </div>
        <RefreshButton onRefresh={loadUsers} title="Refresh list" />
      </div>

      <div className="table-card">
        <UserGrid
          users={users}
          loading={loading}
          pagination={{ ...pagination, total, showSizeChanger: true }}
          onTableChange={handleTableChange}
          onOpenCredit={(user, type) => {
            setActiveUserForCredit(user);
            setCreditType(type);
            setCreditOpen(true);
          }}
          onOpenUpdateSubscription={(user) => {
            setActiveUserForSub(user);
            setUpdateSubOpen(true);
          }}
          onOpenAssignUser={(user) => {
            setActiveUserForAssign(user);
            setAssignOpen(true);
          }}
          onOpenSnapshot={(user) => {
            setActiveUserForSnapshot(user);
            setSnapshotOpen(true);
          }}
          onOpenUpgradeUser={(user) => {
            setActiveUserForUpgrade(user);
            setUpgradeOpen(true);
          }}
          onOpenChangePartner={(user) => {
            setActiveUserForChangePartner(user);
            setChangePartnerOpen(true);
          }}
          onOpenCallWidget={(user) => setActiveCallUser(user)}
          onOpenSendSms={(user) => {
            setActiveUserForSms(user);
            setSendSmsOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          permissions={permissions}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
        />
      </div>

      <AddUserWizard open={addUserOpen} onClose={() => setAddUserOpen(false)} onSave={handleAddUser} />

      <UpdateSubscriptionDrawer
        open={updateSubOpen}
        user={activeUserForSub}
        onClose={() => setUpdateSubOpen(false)}
        onSave={handleUpdateSubscription}
      />

      <CreditDrawer
        open={creditOpen}
        user={activeUserForCredit}
        creditType={creditType}
        onClose={() => setCreditOpen(false)}
        onSave={handleAddCredit}
      />

      <AssignUserModal
        open={assignOpen}
        user={activeUserForAssign}
        onClose={() => setAssignOpen(false)}
        onSave={handleAssignUser}
      />

      <SnapshotDrawer
        open={snapshotOpen}
        user={activeUserForSnapshot}
        onClose={() => setSnapshotOpen(false)}
        onSave={handleCreateSnapshot}
      />

      <UpgradeUserDrawer
        open={upgradeOpen}
        user={activeUserForUpgrade}
        onClose={() => setUpgradeOpen(false)}
        onSave={handleUpgradeUser}
      />

      <ChangePartnerDrawer
        open={changePartnerOpen}
        user={activeUserForChangePartner}
        onClose={() => setChangePartnerOpen(false)}
        onSave={handleChangePartnerRequest}
      />

      <SendSmsDrawer
        open={sendSmsOpen}
        user={activeUserForSms}
        onClose={() => setSendSmsOpen(false)}
        onSend={handleSendSms}
      />

      {activeCallUser && (
        <CallWidget user={activeCallUser} onClose={() => setActiveCallUser(null)} />
      )}
    </div>
  );
};

export default ManageUser;

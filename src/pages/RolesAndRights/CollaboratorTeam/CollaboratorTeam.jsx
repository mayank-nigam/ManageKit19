import React, { useState, useEffect } from 'react';
import { Table, Dropdown, Drawer, Switch, Input, Select, Button } from 'antd';
import { MoreVertical, Edit2, Trash2, PlusSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePermissions from './usePermissions';
import Swal from 'sweetalert2';
import { getSession } from '../../../getSession';
import axios from 'axios';
import './TaxSettings.css';

const { Option } = Select;
const NEWV3_BASE_URL = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const CollaboratorTeam = () => {
  const navigate = useNavigate();
  const { token, userId, TokenId } = getSession();
  const sessionToken = token || TokenId;

  const { permissions, loading: permsLoading } = usePermissions('PAG10366');
  const crmOperationPerms = permissions.find(p => p.ModuleCode === 'PAG10366') || permissions[0];

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userList, setUserList] = useState([]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState(0);

  const [formData, setFormData] = useState({
    Name: '',
    AddedUser: []
  });
  const [formErrors, setFormErrors] = useState({});

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');

  const fetchUserList = async () => {
    try {
      const payload = {
        Token: sessionToken,
        Details: { ParentId: Number(userId || 34594), UserId: Number(userId || 34594) }
      };
      const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/funcToGetUserList`, payload);
      if (response.data && response.data.Status === 1) {
        setUserList(response.data.Details || []);
      }
    } catch (err) {
      console.error('Failed to load user list', err);
    }
  };

  const loadTeams = async () => {
    setLoading(true);
    try {
      const payload = {
        Token: sessionToken,
        Details: { UserID: userId, Collname: searchText }
      };
      const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/funcToGetCollTeamList`, payload);
      if (response.data && response.data.Status === 1) {
        let data = response.data.Details || [];
        if (searchText) {
           const lowerSearch = searchText.toLowerCase();
           data = data.filter(d => d.CollabTeamName?.toLowerCase().includes(lowerSearch));
        }
        setTeams(data);
        setPagination(prev => ({ ...prev, total: data.length }));
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.error('Failed to load collaborator teams', err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTeams();
  }, [searchText]);

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleToggleEnable = async (teamId, checked) => {
    try {
      const payload = {
        Token: sessionToken,
        Details: {
          TeamId: teamId,
          IsEnableStatus: checked ? 1 : 0
        }
      };
      const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/ChangeCollTeamStatus`, payload);
      if (response.data && response.data.Status === 1) {
        setTeams(prevTeams =>
          prevTeams.map(t =>
            (t.Id === teamId || t.CollTeam === teamId) ? { ...t, isActive: checked ? 1 : 0, IsActive: checked ? 1 : 0 } : t
          )
        );
      } else {
        Swal.fire('Error', 'Unable to update status', 'error');
      }
    } catch (err) {
      console.error('Failed to update toggle', err);
    }
  };

  const handleDelete = (teamId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Collaborator Team?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            Token: sessionToken,
            Details: {
              Id: teamId,
              Flag: "Team" 
            }
          };
          const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/DeleteTeamTypeById`, payload);
          if (response.data && response.data.Status === 1) {
            Swal.fire('Deleted!', 'Collaborator Team has been deleted.', 'success');
            loadTeams();
          } else {
            Swal.fire('Error', response.data.Message || 'Unable to delete.', 'error');
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Unable to process request.', 'error');
        }
      }
    });
  };

  const handleEdit = async (teamId) => {
    try {
      setLoading(true);
      const payload = {
        Token: sessionToken,
        Details: { UserID: userId, CollId: teamId } // Adjust property name if api expects 'TeamId'
      };
      const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/GetCollTeamById`, payload);

      if (response.data && response.data.Status === 1) {
        const teamData = response.data.Details?.[0] || response.data.Details;
        if (teamData) {
          setEditingId(teamData.Id || teamData.CollTeam || teamId);
          let mappedUsers = [];
          if (teamData.TeamUsers && Array.isArray(teamData.TeamUsers)) {
             mappedUsers = teamData.TeamUsers.map(u => String(u.UserId || u.Id));
          } else if (teamData.AddedUser) {
             if (Array.isArray(teamData.AddedUser)) mappedUsers = teamData.AddedUser.map(String);
             else if (typeof teamData.AddedUser === 'string') mappedUsers = teamData.AddedUser.split(',');
          } else if (teamData.ActionMapped) {
             mappedUsers = teamData.ActionMapped.split(',');
          }

          setFormData({
            Name: teamData.TeamName || teamData.CollabTeamName || teamData.Name || '',
            AddedUser: mappedUsers
          });
          setFormErrors({});
          setDrawerVisible(true);
        }
      } else {
          Swal.fire('Error', 'Unable to load team details.', 'error');
      }
    } catch (err) {
      console.error("Failed to load details for edit", err);
      Swal.fire('Error', 'Unable to load details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(0);
    setFormData({
      Name: '',
      AddedUser: []
    });
    setFormErrors({});
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Name) {
      errors.Name = 'Team Name is required.';
    }
    if (!formData.AddedUser || formData.AddedUser.length === 0) {
      errors.AddedUser = 'Please select at least one user.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTeam = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        Token: sessionToken,
        Details: {
          UserID: Number(userId || 34594),
          CollabTeamName: formData.Name.trim(),
          AddedUser: formData.AddedUser, // array of strings
          CollTeam: editingId
        }
      };

      const response = await axios.post(`${NEWV3_BASE_URL}/UserCRM/AddCollaboratorTeam`, payload);

      if (response.data && response.data.Status === 1) {
        Swal.fire('Success', 'Collaborator Team saved successfully.', 'success');
        setDrawerVisible(false);
        loadTeams();
      } else {
        Swal.fire('Error', response.data.Message || 'Validation Failed', 'warning');
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire('Error', 'Unable to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = (record) => {
    const items = [];
    const id = record.Id || record.CollTeam;
    if (!crmOperationPerms || crmOperationPerms.Edit) {
      items.push({
        key: 'edit',
        label: (
          <div className="flex items-center text-gray-700">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </div>
        ),
        onClick: () => handleEdit(id)
      });
    }
    if ((!crmOperationPerms || crmOperationPerms.Edit) && (!crmOperationPerms || crmOperationPerms.Delete)) {
      items.push({ type: 'divider' });
    }
    if (!crmOperationPerms || crmOperationPerms.Delete) {
      items.push({
        key: 'delete',
        label: (
          <div className="flex items-center text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </div>
        ),
        onClick: () => handleDelete(id)
      });
    }
    return items;
  };

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'TeamName',
      key: 'TeamName',
      render: (text, record) => <span className="font-medium text-gray-800">{text || record.Name || record.CollabTeamName}</span>
    },
    {
      title: 'Enabled',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val, record) => {
        const activeVal = record.isActive !== undefined ? record.isActive : record.IsActive;
        const isEnabled = activeVal === 1 || activeVal === true || activeVal === '1' || activeVal === 'true';
        return (
          <Switch
            checked={isEnabled}
            onChange={(checked) => handleToggleEnable(record.Id || record.CollTeam, checked)}
            style={{ backgroundColor: isEnabled ? '#10b981' : '#d1d5db' }}
            className="bg-gray-300 [&.ant-switch-checked]:bg-green-500"
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'Actions',
      width: 100,
      render: (_, record) => {
        const items = menuItems(record);
        if (items.length === 0) return null;
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" className="text-gray-500 hover:bg-gray-100 flex items-center justify-center p-1" style={{ width: '32px', height: '32px' }}>
              <MoreVertical className="w-5 h-5" />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  if (crmOperationPerms && !crmOperationPerms.View) {
    return (
      <div className="task-module-root" style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <X size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.5' }}>
            You do not have permission to view Collaborator Team Settings. Please contact your administrator if you believe this is a mistake.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { localStorage.clear(); navigate('/'); }} 
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tax-settings-container min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Collaborator Teams</h1>
          <p className="text-gray-500 m-0 text-sm mt-1">Manage Teams and assign Users.</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-1 items-center justify-end space-x-6 w-full md:w-auto">
          <div className="relative w-full sm:w-80 md:w-96">
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search or filter results.."
              value={searchText}
              onChange={handleSearch}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {(!crmOperationPerms || crmOperationPerms.Add) && (
            <button
              className="flex items-center whitespace-nowrap px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              onClick={handleAddNew}
            >
              <PlusSquare className="w-4 h-4 mr-2" />
              Add Team
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={teams}
          rowKey={(record) => record.Id || record.CollTeam}
          pagination={{
            ...pagination,
            position: ['bottomCenter'],
            showSizeChanger: true,
          }}
          loading={loading}
          onChange={handleTableChange}
          className="tax-settings-table"
          locale={{ emptyText: <div className="py-8 text-gray-500 text-center"><div className="mb-2">No record Found.</div><button onClick={handleAddNew} className="text-blue-600 hover:underline">Click here to add your first team</button></div> }}
        />
      </div>

      <Drawer
        title={<div className="font-bold text-lg">{editingId === 0 ? 'New Team' : 'Edit Team'}</div>}
        placement="right"
        onClose={handleDrawerClose}
        open={drawerVisible}
        width={450}
        zIndex={2000}
        footer={
          <div className="flex justify-end gap-3 pb-2 pt-2 pr-4 pl-4">
            <Button onClick={handleDrawerClose} className="px-6 border-gray-300 text-gray-700 hover:border-gray-400">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveTeam}
              loading={saving}
              className="bg-green-600 hover:bg-green-700 border-green-600 px-6"
            >
              Submit
            </Button>
          </div>
        }
        className="tax-settings-drawer"
      >
        <div className="space-y-6 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter Team Name"
              value={formData.Name}
              onChange={(e) => {
                setFormData({ ...formData, Name: e.target.value });
                if (formErrors.Name) setFormErrors({ ...formErrors, Name: '' });
              }}
              className={`w-full py-2 ${formErrors.Name ? 'border-red-500' : ''}`}
            />
            {formErrors.Name && <p className="text-red-500 text-xs mt-1">{formErrors.Name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Users <span className="text-red-500">*</span>
            </label>
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Users"
              value={formData.AddedUser}
              onChange={(values) => {
                setFormData({ ...formData, AddedUser: values });
                if (formErrors.AddedUser) setFormErrors({ ...formErrors, AddedUser: '' });
              }}
              className={`w-full ${formErrors.AddedUser ? 'border-red-500' : ''}`}
            >
              {userList.map(user => (
                <Option key={user.UserId || user.Id} value={String(user.UserId || user.Id)}>
                  {user.UserName || user.PersonName || user.Name}
                </Option>
              ))}
            </Select>
            {formErrors.AddedUser && <p className="text-red-500 text-xs mt-1">{formErrors.AddedUser}</p>}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CollaboratorTeam;

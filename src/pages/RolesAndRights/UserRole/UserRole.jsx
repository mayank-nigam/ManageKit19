import React, { useState, useEffect } from 'react';
import { Input, Switch, Checkbox, Button } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import PremiumTable from '../../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../../components/common/GlobalSubheader/GlobalSubheader';
import Alert from '../../../components/common/Alert/Alert';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const API_TOKEN = localStorage.getItem("API_TOKEN") || process.env.REACT_APP_TOKE_UNIVERSAL_TOKEN || "-2295521862261168";
const USER_ID = parseInt(localStorage.getItem("USER_ID")) || 34594;// Using hardcoded ID per existing pattern

const UserRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({ show: true, type, title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, show: false }));
  };

  const fetchApi = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { data };
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetRoleList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID }
      });
      
      if (response.data && response.data.Details) {
        setRoles(response.data.Details);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      showAlert('error', 'Error', 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const resetForm = () => {
    setEditingRoleId(null);
    setRoleName('');
    setIsActive(true);
  };

  const handleOpenDrawer = (role = null) => {
    if (role) {
      setEditingRoleId(role.RoleId);
      setRoleName(role.RoleName);
      setIsActive(role.Active || false);
    } else {
      resetForm();
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      showAlert('warning', 'Validation Error', 'Role Name is required');
      return;
    }

    try {
      const isEdit = !!editingRoleId;
      const endpoint = isEdit ? 'UpdateRoleMaster' : 'SaveRoleMaster';
      const mode = isEdit ? 'U' : 'I';
      
      const details = {
        Mode: mode,
        RoleName: roleName.trim(),
        RoleCode: "", 
        Active: isActive,
        UserId: USER_ID
      };

      if (isEdit) {
        details.RoleId = editingRoleId;
      }

      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/${endpoint}`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: details
      });

      if (response.data.Details === 1) {
        showAlert('success', 'Success', isEdit ? 'Role updated successfully' : 'Role created successfully');
        handleCloseDrawer();
        fetchRoles();
      } else if (response.data.Details === -2) {
        showAlert('warning', 'Warning', 'Record Already Exist!');
      } else {
        showAlert('error', 'Error', 'Failed to save role');
      }
    } catch (error) {
      console.error("Error saving role:", error);
      showAlert('error', 'Error', 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/DeleteRoleMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "D", RoleId: roleId, UserId: USER_ID }
      });

      if (response.data.Details === 4) {
        showAlert('success', 'Success', 'Role deleted successfully');
        fetchRoles();
      } else {
        showAlert('error', 'Error', 'Failed to delete role');
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      showAlert('error', 'Error', 'Failed to delete role');
    }
  };

  const handleToggleStatus = async (roleId, newStatus) => {
    try {
      const role = roles.find(r => r.RoleId === roleId);
      if (!role) return;

      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/UpdateRoleMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { 
          Mode: "U", 
          RoleId: roleId, 
          RoleName: role.RoleName,
          RoleCode: role.RoleCode || "",
          Active: newStatus, 
          UserId: USER_ID
        }
      });

      fetchRoles();
      showAlert('success', 'Success', 'Status updated successfully');
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert('error', 'Error', 'Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'RoleName',
      key: 'RoleName',
      width: '20%',
      sorter: (a, b) => (a.RoleName || '').localeCompare(b.RoleName || ''),

    },
    {
      title: 'Created By',
      dataIndex: 'CreatedUser',
      key: 'CreatedUser',
      width: '15%',
      sorter: (a, b) => (a.CreatedUser || '').localeCompare(b.CreatedUser || ''),
    },
    {
      title: 'Created On',
      dataIndex: 'CreatedDate',
      key: 'CreatedDate',
      width: '20%',
      sorter: (a, b) => new Date(a.CreatedDate || 0) - new Date(b.CreatedDate || 0),
      render: (date, record) => {
        const isCoreRole = ['admin', 'user', 'guest'].includes((record.RoleName || '').toLowerCase());
        if (isCoreRole) return '';
        return date ? dayjs(date).format('DD-MMM-YYYY hh:mm A') : '';
      },
    },
    {
      title: 'Status',
      dataIndex: 'Active',
      key: 'Active',
      width: '15%',
      sorter: (a, b) => Number(a.Active || false) - Number(b.Active || false),
      render: (active, record) => (
        <Switch 
          checked={active} 
          onChange={(checked) => handleToggleStatus(record.RoleId, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          disabled={['admin', 'user', 'guest'].includes((record.RoleName || '').toLowerCase())}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => {
        const isCoreRole = ['admin', 'user', 'guest'].includes((record.RoleName || '').toLowerCase());
        if (isCoreRole) {
          return null;
        }
        return (
          <div className="flex justify-end gap-3">
            <Edit2 
              size={16} 
              className="text-blue-500 cursor-pointer hover:text-blue-700" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDrawer(record);
              }} 
            />
            <Trash2 
              size={16} 
              className="text-red-500 cursor-pointer hover:text-red-700" 
              onClick={(e) => {
                e.stopPropagation();
                showAlert('confirm', 'Confirm Delete', 'Are you sure you want to delete this role?', () => handleDeleteRole(record.RoleId));
              }}
            />
          </div>
        );
      },
    }
  ];

  const filteredRoles = roles.filter(role => 
    role.RoleName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    role.CreatedUser?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <GlobalSubheader 
        title="Role Master" 
        onAddClick={() => handleOpenDrawer()} 
        buttonText="New Role"
        searchPlaceholder="Search roles..."
        onSearch={(data) => setSearchQuery(data.value || '')}
      />
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
          <PremiumTable 
            columns={columns} 
            dataSource={filteredRoles} 
            rowKey="RoleId" 
            loading={loading}
            pagination={{ pageSize: 15 }}
            selectable={false}
          />
        </div>
      </div>

      <OverlayWidget
        title={editingRoleId ? "Edit Role" : "New Role"}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        footer={
          <div className="flex justify-end gap-3 w-full p-4 border-t border-gray-200">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" className="bg-blue-600" onClick={handleSaveRole}>Save</Button>
          </div>
        }
      >
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Role Name <span className="text-red-500">*</span></label>
            <Input 
              placeholder="Enter Role Name" 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block mb-2">Options</label>
            <div className="flex flex-col gap-3">
              <Checkbox 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              >
                Is Active
              </Checkbox>
            </div>
          </div>
        </div>
      </OverlayWidget>

      <Alert 
        show={alertConfig.show}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onClose={closeAlert}
        onCancel={closeAlert}
      />
    </div>
  );
};

export default UserRole;

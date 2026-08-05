import React, { useState, useEffect } from 'react';
import { Select, Checkbox, Button } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import PremiumTable from '../../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../../components/common/GlobalSubheader/GlobalSubheader';
import Alert from '../../../components/common/Alert/Alert';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const API_TOKEN = localStorage.getItem("API_TOKEN") || process.env.REACT_APP_TOKE_UNIVERSAL_TOKEN || "-2295521862261168";
const USER_ID = parseInt(localStorage.getItem("USER_ID")) || 34594;// Using hardcoded ID per existing pattern

const { Option } = Select;

const UserRoleMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [rolesList, setRolesList] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetUserRoleMappingMasterList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID, FilterText: "" }
      });
      
      if (response.data && response.data.Details) {
        setMappings(response.data.Details);
      }
    } catch (error) {
      console.error("Error fetching role mappings:", error);
      showAlert('error', 'Error', 'Failed to fetch user role mappings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
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
        setRolesList(response.data.Details);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchRoles();
  }, []);

  const resetForm = () => {
    setSelectedRole(null);
    setUserList([]);
    setIsEditMode(false);
  };

  const loadRoleUsers = async (roleCode) => {
    setIsUsersLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetUserRoleMapping_RoleCode`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "EN", RoleCode: roleCode, UserId: USER_ID }
      });
      
      if (response.data && response.data.Details) {
        // Map the data into an array with checkboxes for UI
        const mappedUsers = response.data.Details.map(user => ({
          ...user,
          Check_ed: !!user.RoleName, // If they have a RoleName in this context, they are mapped to the role
          Check_PeerView: !!user.PeerView // If PeerView has a value, it's mapped
        }));
        setUserList(mappedUsers);
      } else {
        // In case of error (like ParentId missing in old SP), we can fallback to empty array or try something else
        setUserList([]);
        showAlert('warning', 'Warning', 'Failed to load user list for this role due to database missing columns, proceeding with empty list.');
      }
    } catch (error) {
      console.error("Error fetching users for role:", error);
      setUserList([]);
      showAlert('warning', 'Warning', 'Failed to load user list for this role, it might be an issue with the DB schema.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleOpenDrawer = async (mapping = null) => {
    resetForm();
    if (mapping) {
      setIsEditMode(true);
      setSelectedRole(mapping.RoleCode);
      await loadRoleUsers(mapping.RoleCode);
    } else {
      await loadRoleUsers("");
    }
    setIsDrawerOpen(true);
  };

  const handleRoleChange = async (value) => {
    setSelectedRole(value);
    if (value) {
      await loadRoleUsers(value);
    } else {
      setUserList([]);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handleSaveMapping = async () => {
    if (!selectedRole) {
      showAlert('warning', 'Validation Error', 'Please select a Role');
      return;
    }

    const assignedUsers = userList.filter(u => u.Check_ed).map(u => u.UserId).join(',');
    const peerViewUsers = userList.filter(u => u.Check_PeerView).map(u => u.UserId).join(',');

    try {
      const mode = isEditMode ? 'U' : 'I';
      
      const details = {
        Mode: mode,
        RoleCode: selectedRole,
        UserCodeList: assignedUsers,
        PeerViewList: peerViewUsers,
        Active: true,
        UserId: USER_ID
      };

      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/SaveUserRoleMappingMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: details
      });

      if (response.data.Details === 1) {
        showAlert('success', 'Success', isEditMode ? 'Mapping updated successfully' : 'Mapping created successfully');
        handleCloseDrawer();
        fetchMappings();
      } else if (response.data.Details === -2) {
        showAlert('warning', 'Warning', 'Record Already Exist!');
      } else {
        showAlert('error', 'Error', 'Failed to save mapping');
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
      showAlert('error', 'Error', 'Failed to save mapping');
    }
  };

  const handleDeleteMapping = async (roleCode) => {
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/DeleteUserRoleMappingMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "D", RoleCode: roleCode, UserId: USER_ID }
      });

      if (response.data.Details === 4 || response.data.Details === 1) {
        showAlert('success', 'Success', 'Mapping deleted successfully');
        fetchMappings();
      } else if (response.data.Details === -2) {
        showAlert('warning', 'Warning', 'Cannot delete mapping because it is currently in use.');
      } else {
        showAlert('error', 'Error', 'Failed to delete mapping');
      }
    } catch (error) {
      console.error("Error deleting mapping:", error);
      showAlert('error', 'Error', 'Failed to delete mapping');
    }
  };

  const handleUserCheck = (userId, field, checked) => {
    setUserList(prev => prev.map(u => u.UserId === userId ? { ...u, [field]: checked } : u));
  };

  const handleCheckAll = (field, checked) => {
    setUserList(prev => prev.map(u => ({ ...u, [field]: checked })));
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
      title: 'User(s) Count',
      dataIndex: 'UsersCount',
      key: 'UsersCount',
      width: '15%',
      sorter: (a, b) => Number(a.UsersCount || 0) - Number(b.UsersCount || 0),
    },
    {
      title: 'User Names',
      dataIndex: 'UserNames',
      key: 'UserNames',
      width: '40%',
      sorter: (a, b) => (a.UserNames || '').localeCompare(b.UserNames || ''),
      render: (text) => text || '-',
    },
    {
      title: 'Created By',
      dataIndex: 'CreatedUser',
      key: 'CreatedUser',
      width: '15%',
      sorter: (a, b) => (a.CreatedUser || '').localeCompare(b.CreatedUser || ''),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
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
              showAlert('confirm', 'Confirm Delete', 'Are you sure you want to delete this mapping?', () => handleDeleteMapping(record.RoleCode));
            }}
          />
        </div>
      ),
    }
  ];

  const filteredMappings = mappings.filter(mapping => 
    mapping.RoleName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    mapping.CreatedUser?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allRolesChecked = userList.length > 0 && userList.every(u => u.Check_ed);
  const someRolesChecked = userList.some(u => u.Check_ed);
  
  const allPeerViewsChecked = userList.length > 0 && userList.every(u => u.Check_PeerView);
  const somePeerViewsChecked = userList.some(u => u.Check_PeerView);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <GlobalSubheader 
        title="User Role Mapping" 
        onAddClick={() => handleOpenDrawer()} 
        buttonText="New Mapping"
        searchPlaceholder="Search mappings..."
        onSearch={(data) => setSearchQuery(data.value || '')}
      />
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
          <PremiumTable 
            columns={columns} 
            dataSource={filteredMappings} 
            rowKey="RoleCode" 
            loading={loading}
            pagination={{ pageSize: 15 }}
            selectable={false}
          />
        </div>
      </div>

      <OverlayWidget
        title={isEditMode ? "Edit User Role Mapping" : "New User Role Mapping"}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        width="w-[60vw]"
        footer={
          <div className="flex justify-end gap-3 w-full p-4 border-t border-gray-200">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" className="bg-blue-600" onClick={handleSaveMapping}>Update</Button>
          </div>
        }
      >
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-1 mb-6 shrink-0 w-1/2">
            <label className="text-sm font-medium text-gray-700">Select Role</label>
            <Select
              className="w-full"
              placeholder="Select Role"
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={isEditMode}
              options={rolesList.map(role => ({ label: role.RoleName, value: role.RoleCode }))}
            />
          </div>
          
          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <div className="border border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden bg-white">
              {isUsersLoading ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
              ) : (
                <>
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center shrink-0">
                    <div className="flex-1 font-medium text-gray-700 pl-8">Name</div>
                    <div className="w-24 text-center font-medium text-gray-700 flex flex-col items-center">
                      <span className="mb-1 text-xs">Role</span>
                      <Checkbox 
                        checked={allRolesChecked}
                        indeterminate={!allRolesChecked && someRolesChecked}
                        onChange={(e) => handleCheckAll('Check_ed', e.target.checked)}
                      />
                    </div>
                    <div className="w-24 text-center font-medium text-gray-700 flex flex-col items-center">
                      <span className="mb-1 text-xs">AddPeerView</span>
                      <Checkbox 
                        checked={allPeerViewsChecked}
                        indeterminate={!allPeerViewsChecked && somePeerViewsChecked}
                        onChange={(e) => handleCheckAll('Check_PeerView', e.target.checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-2">
                    {userList.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No users available or select a role first.</div>
                    ) : (
                      userList.map(user => (
                        <div key={user.UserId} className="flex items-center p-2 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0 transition-colors">
                          <div className="flex-1 text-gray-700">{user.User_Login_And_Name || user.User_Login || `User ID: ${user.UserId}`}</div>
                          <div className="w-24 flex justify-center">
                            <Checkbox 
                              checked={user.Check_ed}
                              onChange={(e) => handleUserCheck(user.UserId, 'Check_ed', e.target.checked)}
                            />
                          </div>
                          <div className="w-24 flex justify-center">
                            <Checkbox 
                              checked={user.Check_PeerView}
                              onChange={(e) => handleUserCheck(user.UserId, 'Check_PeerView', e.target.checked)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
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

export default UserRoleMapping;

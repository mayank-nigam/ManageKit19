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
const USER_ID = parseInt(localStorage.getItem("USER_ID")) || 34594; // Using hardcoded ID per existing pattern

const TeamMaster = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [userList, setUserList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

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

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetTeamList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID, fromdate: "", todate: "", teamname: "", status: "" }
      });
      
      if (response.data && response.data.Details) {
        setTeams(response.data.Details);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      showAlert('error', 'Error', 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const resetForm = () => {
    setEditingTeamId(null);
    setTeamName('');
    setIsActive(true);
    setUserList([]);
  };

  const loadTeamUsers = async (teamId) => {
    setIsUsersLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetTeam_TeamId_UserId`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "EU", TeamId: teamId || 0, UserId: USER_ID }
      });
      
      if (response.data && response.data.Details && response.data.Details.userHashedList) {
        setUserList(response.data.Details.userHashedList);
      }
    } catch (error) {
      console.error("Error fetching users for team:", error);
      showAlert('error', 'Error', 'Failed to fetch user list');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleOpenDrawer = async (team = null) => {
    if (team) {
      setEditingTeamId(team.TeamId);
      setTeamName(team.TeamName);
      setIsActive(team.Active);
      await loadTeamUsers(team.TeamId);
    } else {
      resetForm();
      await loadTeamUsers(0);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      showAlert('warning', 'Validation Error', 'Team Name is required');
      return;
    }

    const selectedUsers = userList.filter(u => u.Check_ed).map(u => u.User_Id).join(', ');
    if (!selectedUsers) {
      showAlert('warning', 'Validation Error', 'At least 1 user is required to create or update a team');
      return;
    }

    try {
      const isEdit = !!editingTeamId;
      const endpoint = isEdit ? 'UpdateTeamMaster' : 'SaveTeamMaster';
      const mode = isEdit ? 'U' : 'I';

      const details = {
        Mode: mode,
        TeamName: teamName.trim(),
        TeamCode: "", 
        UserCodeList: selectedUsers,
        Active: isActive,
        UserId: USER_ID
      };

      if (isEdit) {
        details.TeamId = editingTeamId;
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
        showAlert('success', 'Success', isEdit ? 'Team updated successfully' : 'Team created successfully');
        handleCloseDrawer();
        fetchTeams();
      } else if (response.data.Details === -2) {
        showAlert('warning', 'Warning', 'Record Already Exist!');
      } else {
        showAlert('error', 'Error', 'Failed to save team');
      }
    } catch (error) {
      console.error("Error saving team:", error);
      showAlert('error', 'Error', 'Failed to save team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/DeleteTeamMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "D", TeamId: teamId, UserId: USER_ID }
      });

      if (response.data.Details === 4 || response.data.Details === 1) {
        showAlert('success', 'Success', 'Team deleted successfully');
        fetchTeams();
      } else if (response.data.Details === -2) {
        showAlert('warning', 'Warning', 'Cannot delete team because it is currently in use.');
      } else {
        showAlert('error', 'Error', 'Failed to delete team');
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      showAlert('error', 'Error', 'Failed to delete team');
    }
  };

  const handleToggleStatus = async (teamId, newStatus) => {
    try {
      // We need to fetch the existing user list for this team to keep them intact
      const getTeamRes = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetTeam_TeamId_UserId`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "EU", TeamId: teamId, UserId: USER_ID }
      });
      
      let currentUserCodeList = "";
      let currentTeamName = "";
      if (getTeamRes.data && getTeamRes.data.Details) {
        currentTeamName = getTeamRes.data.Details.TeamMasterBO?.TeamName || "";
        const currentUsers = getTeamRes.data.Details.userHashedList || [];
        currentUserCodeList = currentUsers.filter(u => u.Check_ed).map(u => u.User_Id).join(', ');
      }

      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/UpdateTeamMaster`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { 
          Mode: "U", 
          TeamId: teamId, 
          TeamName: currentTeamName,
          TeamCode: "",
          UserCodeList: currentUserCodeList,
          Active: newStatus, 
          UserId: USER_ID 
        }
      });

      if (response.data.Details === 1) {
        fetchTeams();
        showAlert('success', 'Success', 'Status updated successfully');
      } else {
        showAlert('error', 'Error', 'Failed to update status');
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert('error', 'Error', 'Failed to update status');
    }
  };

  const handleUserCheck = (userId, checked) => {
    setUserList(prev => prev.map(u => u.User_Id === userId ? { ...u, Check_ed: checked } : u));
  };

  const handleCheckAll = (checked) => {
    setUserList(prev => prev.map(u => ({ ...u, Check_ed: checked })));
  };

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'TeamName',
      key: 'TeamName',
      width: '30%',
      sorter: (a, b) => (a.TeamName || '').localeCompare(b.TeamName || ''),
    },
    {
      title: 'Created By',
      dataIndex: 'CreatedUser',
      key: 'CreatedUser',
      width: '20%',
      sorter: (a, b) => (a.CreatedUser || '').localeCompare(b.CreatedUser || ''),
    },
    {
      title: 'Created On',
      dataIndex: 'CreatedDate',
      key: 'CreatedDate',
      width: '20%',
      sorter: (a, b) => new Date(a.CreatedDate || 0) - new Date(b.CreatedDate || 0),
      render: (date) => date ? dayjs(date).format('DD-MMM-YYYY hh:mm A') : '',
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
          onChange={(checked) => handleToggleStatus(record.TeamId, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
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
              showAlert('confirm', 'Confirm Delete', 'Are you sure you want to delete this team?', () => handleDeleteTeam(record.TeamId));
            }}
          />
        </div>
      ),
    }
  ];

  const filteredTeams = teams.filter(team => 
    team.TeamName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.CreatedUser?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allUsersChecked = userList.length > 0 && userList.every(u => u.Check_ed);
  const someUsersChecked = userList.some(u => u.Check_ed);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <GlobalSubheader 
        title="Team Master" 
        onAddClick={() => handleOpenDrawer()} 
        buttonText="New Team"
        searchPlaceholder="Search teams..."
        onSearch={(data) => setSearchQuery(data.value || '')}
      />
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
          <PremiumTable 
            columns={columns} 
            dataSource={filteredTeams} 
            rowKey="TeamId" 
            loading={loading}
            pagination={{ pageSize: 15 }}
            selectable={false}
          />
        </div>
      </div>

      <OverlayWidget
        title={editingTeamId ? "Edit Team" : "New Team"}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        width="w-[50vw]"
        footer={
          <div className="flex justify-end gap-3 w-full p-4 border-t border-gray-200">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" className="bg-blue-600" onClick={handleSaveTeam}>Save</Button>
          </div>
        }
      >
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-1 mb-6 shrink-0">
            <label className="text-sm font-medium text-gray-700">Team Name <span className="text-red-500">*</span></label>
            <Input 
              placeholder="Enter Team Name" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-1 shrink-0 mb-4">
             <Checkbox 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              >
                Is Active
             </Checkbox>
          </div>

          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium text-gray-700 block mb-2">User List</label>
            
            <div className="border border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden bg-white">
              {isUsersLoading ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
              ) : (
                <>
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center shrink-0">
                    <Checkbox 
                      checked={allUsersChecked}
                      indeterminate={!allUsersChecked && someUsersChecked}
                      onChange={(e) => handleCheckAll(e.target.checked)}
                      className="font-medium text-gray-700"
                    >
                      Check All
                    </Checkbox>
                    <span className="ml-auto font-medium text-gray-700 text-sm">Name</span>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-2">
                    {userList.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No users available</div>
                    ) : (
                      userList.map(user => (
                        <div key={user.User_Id} className="flex items-center px-2 py-3 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0 transition-colors">
                          <Checkbox 
                            checked={user.Check_ed}
                            onChange={(e) => handleUserCheck(user.User_Id, e.target.checked)}
                            className="flex-1"
                          >
                            <span className="ml-2 text-gray-700">{user.User_Login || `User ID: ${user.User_Id}`}</span>
                          </Checkbox>
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

export default TeamMaster;

import React, { useState, useEffect } from 'react';
import { notification, Input, Select, DatePicker } from 'antd';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import PremiumTable from '../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../components/common/GlobalSubheader/GlobalSubheader';
import API_ENDPOINTS from '../../config/apiEndpoints';
import './UpdateModule.css';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const UPDATE_API_URL = `${NEWV3_BASE_URL}${API_ENDPOINTS.BANNER.banner}`;
const AZURE_BASE_URL = process.env.REACT_APP_SERVICES_AZURE_BASEURL || 'https://serviceskit19.azurewebsites.net/';
const USERS_API_URL = `${NEWV3_BASE_URL}Common/CommonActionModebased`;
const API_TOKEN = "-2295521862261168";
const USER_ID = 34594;

const { TextArea } = Input;
const { Option } = Select;

const UpdateModule = () => {
  const [moduleOptions, setModuleOptions] = useState([]);
  const [formModuleOptions, setFormModuleOptions] = useState([]);
  
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');

  // Form states
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateType, setUpdateType] = useState('Feature');
  const [applicationCode, setApplicationCode] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [users, setUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(7, 'day'));

  useEffect(() => {
    fetchModuleOptions('SALES').then(res => setModuleOptions(res || []));
  }, []);

  useEffect(() => {
    fetchModuleOptions(applicationCode).then(res => setFormModuleOptions(res || []));
  }, [applicationCode]);

  useEffect(() => {
    fetchUpdates();
  }, [selectedModuleFilter]);

  const fetchModuleOptions = async (appCode) => {
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({ Mode: "GetApplicationURLs", ApplicationCode: appCode || null })
      };
      const response = await fetch(`${NEWV3_BASE_URL}Common/CommonActionModebased`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const rawText = await response.text();
        let data;
        try { data = JSON.parse(rawText); } catch(e) { return []; }
        let parsed = typeof data === 'string' ? JSON.parse(data) : data;
        let details = parsed.Details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch(e) {}
        }
        let modulesArr = [];
        if (Array.isArray(parsed)) modulesArr = parsed;
        else if (Array.isArray(details)) modulesArr = details;
        else if (details && Array.isArray(details.data)) modulesArr = details.data;
        else if (details && Array.isArray(details.Data)) modulesArr = details.Data;
        else if (details && Array.isArray(details.Table)) modulesArr = details.Table;
        
        const uniqueOptions = [];
        const seenCodes = new Set();
        
        modulesArr.forEach(mod => {
          let code = mod.ModuleCode;
          if (!code || seenCodes.has(code)) return;
          
          seenCodes.add(code);
          uniqueOptions.push({
            ...mod,
            ModuleCode: code,
            ModuleName: mod.ModuleName || code
          });
        });
        
        return uniqueOptions;
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
    return [];
  };

  const fetchUserOptions = async () => {
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({ Mode: "UserList", UserId: USER_ID })
      };

      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const rawText = await response.text();
        let data;
        try { data = JSON.parse(rawText); } catch(e) { return; }

        let parsed = typeof data === 'string' ? JSON.parse(data) : data;
        let details = parsed.Details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch(e) {}
        }
        
        let usersArr = [];
        if (Array.isArray(parsed)) usersArr = parsed;
        else if (Array.isArray(details)) usersArr = details;
        else if (details && Array.isArray(details.data)) usersArr = details.data;
        else if (details && Array.isArray(details.Data)) usersArr = details.Data;
        else if (details && Array.isArray(details.Table)) usersArr = details.Table;
        else if (parsed.data && Array.isArray(parsed.data)) usersArr = parsed.data;
        else if (parsed.Data && Array.isArray(parsed.Data)) usersArr = parsed.Data;
        else if (parsed.Table && Array.isArray(parsed.Table)) usersArr = parsed.Table;
        
        setUserOptions(usersArr);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "GetUpdates",
          UserId: USER_ID,
          ApplicationCode: "SALES",
          ModuleCode: selectedModuleFilter
        })
      };

      const response = await fetch(UPDATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      let updatesList = parsedData.Details || parsedData.Data || parsedData.Table || parsedData || [];
      if (typeof updatesList === 'string') {
        try { updatesList = JSON.parse(updatesList); } catch(e) {}
      }

      if (Array.isArray(updatesList)) {
        updatesList = updatesList.map(u => ({ ...u, ModuleCode: u.ModuleCode || selectedModuleFilter }));
      }

      setUpdates(Array.isArray(updatesList) ? updatesList : []);
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Failed to fetch updates' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (update = null) => {
    if (update) {
      setEditingId(update.UpdateId);
      setUpdateTitle(update.UpdateTitle);
      setUpdateDescription(update.UpdateDescription);
      setUpdateType(update.UpdateType || 'Feature');
      setApplicationCode(update.ApplicationCode || '');
      setModuleCode(update.ModuleCode || '');
      setUsers(update.Users ? update.Users.split(',').filter(Boolean).map(u => Number(u)) : []);
      setStartDate(update.StartDate ? dayjs(update.StartDate) : dayjs());
      setEndDate(update.EndDate ? dayjs(update.EndDate) : dayjs().add(7, 'day'));
    } else {
      setEditingId(null);
      setUpdateTitle('');
      setUpdateDescription('');
      setUpdateType('Feature');
      setApplicationCode('SALES');
      setModuleCode(selectedModuleFilter); // Default to the currently filtered page when adding
      setUsers([]);
      setStartDate(dayjs());
      setEndDate(dayjs().add(7, 'day'));
    }
    setIsDrawerOpen(true);
    fetchUserOptions();
  };

  const handleSave = async () => {
    if (!updateTitle || !updateDescription || !updateType) {
      notification.warning({ message: 'Title, Description, and Type are required' });
      return;
    }

    try {
      let finalUsers = Array.isArray(users) ? [...users] : [];

      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "SaveUpdates",
          UserId: USER_ID,
          UpdateId: editingId || 0,
          UpdateTitle: updateTitle,
          UpdateDescription: updateDescription,
          UpdateType: updateType,
          StartDate: startDate ? startDate.format('YYYY-MM-DD') : "",
          EndDate: endDate ? endDate.format('YYYY-MM-DD') : "",
          ApplicationCode: applicationCode || "SALES",
          ModuleCode: moduleCode || "",
          Users: finalUsers.join(',')
        })
      };

      const response = await fetch(UPDATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      notification.success({ message: 'Update saved successfully!' });
      setIsDrawerOpen(false);
      fetchUpdates();
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Error saving update' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        const payload = {
          Token: API_TOKEN,
          Details: JSON.stringify({
            Mode: "DeleteUpdates",
            UserId: USER_ID,
            UpdateId: id
          })
        };

        const response = await fetch(UPDATE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        notification.success({ message: 'Update deleted successfully!' });
        fetchUpdates();
      } catch (error) {
        console.error(error);
        notification.error({ message: 'Error deleting update' });
      }
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Feature': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'BugFix': return 'bg-red-100 text-red-700 border-red-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const columns = [
    {
      title: 'Update',
      key: 'Update',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.UpdateTitle}</span>
          <span className="text-xs text-gray-500 line-clamp-1">{record.UpdateDescription}</span>
          <span className={`mt-1 w-max px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeStyle(record.UpdateType)}`}>
            {record.UpdateType || 'Update'}
          </span>
        </div>
      ),
      width: '35%'
    },
    {
      title: 'Page Name',
      key: 'PageName',
      render: (_, record) => {
        const mod = moduleOptions.find(m => m.ModuleCode === record.ModuleCode);
        return <span className="text-sm font-medium">{mod ? mod.ModuleName : record.ModuleCode || '-'}</span>;
      },
      width: '20%'
    },
    {
      title: 'Page Code',
      dataIndex: 'ModuleCode',
      key: 'PageCode',
      render: (text) => <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">{text || '-'}</span>,
      width: '15%'
    },
    {
      title: 'Users',
      dataIndex: 'Users',
      key: 'Users',
      render: (text) => {
        if (!text) return <span className="text-xs text-gray-400">All Users</span>;
        const count = text.split(',').filter(Boolean).length;
        return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{count} User{count > 1 ? 's' : ''}</span>;
      },
      width: '15%'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenDrawer(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete(record.UpdateId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove">
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '15%'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white animate-fadeIn" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <GlobalSubheader 
        title="System Updates"
        addLabel="Add Update"
        onAddClick={() => handleOpenDrawer()}
        searchConfig={[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'date', label: 'Release Date', type: 'date' }
        ]}
        onSearch={(searchData) => console.log('Searching updates with', searchData)}
      />

      <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
        <label className="text-sm font-semibold text-gray-700 mr-3">Filter by Page:</label>
        <Select
          style={{ width: 250 }}
          value={selectedModuleFilter}
          onChange={(value) => setSelectedModuleFilter(value)}
          showSearch
          optionFilterProp="children"
        >
          {moduleOptions.map(mod => {
            const val = mod.ModuleCode || mod.ModuleName;
            return (
              <Option key={val} value={val}>
                {mod.ModuleName ? `${mod.ModuleName} - ${val}` : val || 'Unknown Module'}
              </Option>
            );
          })}
        </Select>
      </div>

      <div className="flex-1 min-h-0">
        <PremiumTable 
          columns={columns}
          dataSource={updates}
          rowKey="UpdateId"
          loading={loading}
        />
      </div>

      <OverlayWidget
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? "Edit System Update" : "Create New System Update"}
        width="w-[500px]"
        footer={
          <>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
            >
              Save Update
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Update Title</label>
              <Input 
                size="large"
                placeholder="Enter update title" 
                value={updateTitle} 
                onChange={(e) => setUpdateTitle(e.target.value)} 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <Select 
                size="large"
                style={{ width: '100%' }} 
                value={updateType} 
                onChange={(value) => setUpdateType(value)}
              >
                <Option value="Feature">Feature</Option>
                <Option value="BugFix">Bug Fix</Option>
                <Option value="Maintenance">Maintenance</Option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <DatePicker 
                size="large"
                style={{ width: '100%' }}
                value={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <DatePicker 
                size="large"
                style={{ width: '100%' }}
                value={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <TextArea 
              size="large"
              rows={4}
              placeholder="Describe the new features or fixes..." 
              value={updateDescription} 
              onChange={(e) => setUpdateDescription(e.target.value)} 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">App Code</label>
              <Select 
                size="large"
                style={{ width: '100%' }}
                dropdownStyle={{ zIndex: 10000 }}
                placeholder="Select App Code" 
                value={applicationCode} 
                onChange={(value) => {
                  setApplicationCode(value);
                  setModuleCode('');
                }} 
              >
                <Option value="SALES">SALES</Option>
                <Option value="AI">AI</Option>
                <Option value="WHATSAPP">WHATSAPP</Option>
                <Option value="HR">HR</Option>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Module Code</label>
              <Select 
                size="large"
                style={{ width: '100%' }}
                dropdownStyle={{ zIndex: 10000 }}
                placeholder="Select Module Code" 
                value={moduleCode} 
                onChange={(value) => setModuleCode(value || '')}
                showSearch
                allowClear
                optionFilterProp="children"
                disabled={!!editingId}
              >
                <Option value="">All Pages</Option>
                {formModuleOptions.map(mod => {
                  const val = mod.ModuleCode || mod.ModuleName;
                  return (
                    <Option key={val} value={val}>
                      {mod.ModuleName ? `${mod.ModuleName} - ${val}` : val || 'Unknown Module'}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Target Users <span className="font-normal text-xs text-gray-400 ml-2">(Leave empty to target everyone)</span>
            </label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select specific users or leave empty for ALL"
              style={{ width: '100%' }}
              dropdownStyle={{ zIndex: 10000 }}
              value={users}
              onChange={(values) => setUsers(values)}
              optionFilterProp="children"
              showSearch
            >
              {userOptions.map(user => (
                <Option key={user.User_ID} value={user.User_ID}>
                  {user.User_ID} - {user.Name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </OverlayWidget>
    </div>
  );
};

export default UpdateModule;

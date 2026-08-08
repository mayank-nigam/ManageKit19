import React, { useState, useEffect } from 'react';
import { Select, Checkbox, Button, Radio } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import PremiumTable from '../../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../../components/common/GlobalSubheader/GlobalSubheader';
import Alert from '../../../components/common/Alert/Alert';

const { Option } = Select;

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const API_TOKEN = localStorage.getItem("API_TOKEN") || process.env.REACT_APP_TOKE_UNIVERSAL_TOKEN || "-2295521862261168";
const USER_ID = parseInt(localStorage.getItem("USER_ID")) || 34594;

const PERMISSION_COLUMNS = [
  { key: 'View', label: 'View' },
  { key: 'Add', label: 'Add' },
  { key: 'Edit', label: 'Edit' },
  { key: 'Delete', label: 'Delete' },
  { key: 'Search', label: 'Search' },
  { key: 'Import', label: 'Import' },
  { key: 'Export', label: 'Export' },
  { key: 'MassUpdate', label: 'Mass Update' },
  { key: 'MassDelete', label: 'Mass Delete' },
  { key: 'Download', label: 'Download' },
  { key: 'Print', label: 'Print' },
  { key: 'AddTask', label: 'Add Task' },
  { key: 'AddAppointment', label: 'Add Appointment' },
  { key: 'AddFollowup', label: 'Add Followup' },
  { key: 'AddNote', label: 'Add Note' },
  { key: 'SendSms', label: 'Send Sms' },
  { key: 'SendMail', label: 'Send Mail' },
  { key: 'SendVoice', label: 'Send Voice' },
  { key: 'MergeLead', label: 'Merge Lead' },
  { key: 'SendWhatsapp', label: 'Send Whatsapp' },
  { key: 'UploadDocument', label: 'Upload Document' },
  { key: 'DeleteDocument', label: 'Delete Document' },
  { key: 'AddDeal', label: 'Add Deal' },
  { key: 'AddTax', label: 'Add Tax' },
  { key: 'AddQuotation', label: 'Add Quotation' },
  { key: 'AddInvoice', label: 'Add Invoice' },
  { key: 'AddWebform', label: 'Add Webform' },
  { key: 'AddCustomField', label: 'Add Custom Field' },
  { key: 'MassAssign', label: 'Mass Assign' },
  { key: 'MassSMS', label: 'Mass SMS' },
  { key: 'MassEmail', label: 'Mass Email' },
  { key: 'MassBroadcast', label: 'Mass Broadcast' }
];
const RolePermissionMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Form State
  const [rolesList, setRolesList] = useState([]);
  const [scopeList, setScopeList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [moduleAppMap, setModuleAppMap] = useState({});
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  
  const [permissions, setPermissions] = useState([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState(null);

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
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetRolePermissionMappingMasterList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID, filterText: "" }
      });
      
      if (response.data && response.data.Details) {
        setMappings(response.data.Details);
      }

      // Fetch modules for both applications to map ModuleCode to Application Name
      try {
        const payloadBase = { Token: API_TOKEN, LoggedUserId: USER_ID, Message: "", MAC_Address: "", IP_Address: "" };
        const [modResKit, modResSales] = await Promise.all([
          fetchApi(`${NEWV3_BASE_URL}UserAuth/GetModuleMasterListModule`, { ...payloadBase, Details: { Mode: "SP", ApplicationCode: "KIT19" } }),
          fetchApi(`${NEWV3_BASE_URL}UserAuth/GetModuleMasterListModule`, { ...payloadBase, Details: { Mode: "SP", ApplicationCode: "Sales" } })
        ]);
        
        const appMap = {};
        if (modResKit.data?.Details) {
          modResKit.data.Details.forEach(m => appMap[m.ModuleCode] = 'Management');
        }
        if (modResSales.data?.Details) {
          modResSales.data.Details.forEach(m => appMap[m.ModuleCode] = 'Sales');
        }
        setModuleAppMap(appMap);
      } catch (err) {
        console.error("Error fetching module mappings:", err);
      }
    } catch (error) {
      console.error("Error fetching mappings:", error);
      showAlert('error', 'Error', 'Failed to fetch role permission mappings');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const rolesRes = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetRoleList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID }
      });
      if (rolesRes.data && rolesRes.data.Details) setRolesList(rolesRes.data.Details);

      const scopeRes = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetScopeList`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "S", UserId: USER_ID }
      });
      if (scopeRes.data && scopeRes.data.Details) setScopeList(scopeRes.data.Details);

      // Module fetching is now dependent on Application Module selection
      
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const resetForm = () => {
    setSelectedRole(null);
    setSelectedScope(null);
    setSelectedApplicationCode(null);
    setSelectedModule(null);
    setPermissions([]);
    setIsEditMode(false);
    setEditingMappingId(null);
  };

  const fetchModules = async (appCode) => {
    if (!appCode) {
      setModuleList([]);
      return;
    }
    try {
      const modRes = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetModuleMasterListModule`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "SP", ApplicationCode: appCode }
      });
      if (modRes.data && modRes.data.Details) setModuleList(modRes.data.Details);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      fetchModules(selectedApplicationCode);
      setSelectedModule(null);
    }
  }, [selectedApplicationCode]);

  const loadPermissions = async (roleCode, scopeCode, moduleCode) => {
    if (!roleCode || !scopeCode || !moduleCode) return;
    
    setIsPermissionsLoading(true);
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetRolePermissionMappingModuleChild`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "SC", RoleCode: roleCode, ScopeCode: scopeCode, ModuleCode: moduleCode, UserId: USER_ID }
      });
      
      if (response.data && response.data.Details) {
        setPermissions(response.data.Details.map(p => {
          const mapped = { ...p };
          PERMISSION_COLUMNS.forEach(col => {
            mapped[`Check_${col.key}`] = !!p[col.key];
          });
          return mapped;
        }));
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions([]);
    } finally {
      setIsPermissionsLoading(false);
    }
  };

  const handleOpenDrawer = async (mapping = null) => {
    resetForm();
    await fetchDropdowns();
    
    if (mapping) {
      setIsEditMode(true);
      setEditingMappingId(mapping.RolePermissionMappingId);
      
      // Fetch details for edit
      try {
          const detailRes = await fetchApi(`${NEWV3_BASE_URL}UserAuth/GetRolePermissionMapping_RolePermissionMappingId`, {
            Token: API_TOKEN,
            LoggedUserId: USER_ID,
            Message: "",
            MAC_Address: "",
            IP_Address: "",
            Details: { Mode: "E", RolePermissionMappingId: mapping.RolePermissionMappingId, UserId: USER_ID }
          });
          
          if(detailRes.data && detailRes.data.Details && detailRes.data.Details.length > 0) {
              const data = detailRes.data.Details[0];
              setSelectedRole(data.RoleCode);
              setSelectedScope(data.ScopeCode);
              setSelectedModule(data.ModuleCode);
              
              // Load permissions
              const mappedPerms = detailRes.data.Details.map(p => {
                  const mapped = { ...p };
                  PERMISSION_COLUMNS.forEach(col => {
                    mapped[`Check_${col.key}`] = !!p[col.key];
                  });
                  return mapped;
              });
              setPermissions(mappedPerms);
          }
      } catch (err) {
          console.error(err);
      }
    }
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    if (!isEditMode && selectedRole && selectedScope && selectedModule) {
      loadPermissions(selectedRole, selectedScope, selectedModule);
    }
  }, [selectedRole, selectedScope, selectedModule, isEditMode]);


  const handleSaveMapping = async () => {
    if (!selectedRole || !selectedScope || !selectedModule) {
      showAlert('warning', 'Validation Error', 'Please select Role, Scope, and Module');
      return;
    }

    try {
      const mode = isEditMode ? 'U' : 'I';
      
      const transactions = permissions.filter(p => PERMISSION_COLUMNS.some(col => p[`Check_${col.key}`])).map(p => {
          const trans = { ModuleCode: p.ModuleCode };
          PERMISSION_COLUMNS.forEach(col => {
            trans[col.key] = !!p[`Check_${col.key}`];
          });
          return trans;
      });

      const payloadModel = {
        Mode: mode,
        ParentId: 0,
        UserId: USER_ID,
        RoleCode: selectedRole,
        ScopeCode: selectedScope,
        ModuleCode: selectedModule,
        IsActive: true,
        transactions: transactions
      };
      
      if(isEditMode) {
          payloadModel.RolePermissionMappingId = editingMappingId;
      }

      const endpoint = isEditMode ? 'UpdateRolePermissionMapping' : 'SaveRolePermissionMapping';

      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/${endpoint}`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: JSON.stringify(payloadModel)
      });

      showAlert('success', 'Success', isEditMode ? 'Mapping updated successfully' : 'Mapping created successfully');
      handleCloseDrawer();
      fetchMappings();
      
    } catch (error) {
      console.error("Error saving mapping:", error);
      showAlert('error', 'Error', 'Failed to save mapping');
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    try {
      const response = await fetchApi(`${NEWV3_BASE_URL}UserAuth/DeleteRolePermissionMapping`, {
        Token: API_TOKEN,
        LoggedUserId: USER_ID,
        Message: "",
        MAC_Address: "",
        IP_Address: "",
        Details: { Mode: "D", RolePermissionMappingId: mappingId, UserId: USER_ID }
      });

      showAlert('success', 'Success', 'Mapping deleted successfully');
      fetchMappings();
    } catch (error) {
      console.error("Error deleting mapping:", error);
      showAlert('error', 'Error', 'Failed to delete mapping');
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handlePermissionCheck = (moduleCode, field, checked) => {
    setPermissions(prev => prev.map(p => p.ModuleCode === moduleCode ? { ...p, [field]: checked } : p));
  };
  
  const handleCheckAll = (field, checked) => {
    setPermissions(prev => prev.map(p => ({ ...p, [field]: checked })));
  };

  const columns = [
    { title: 'Role', dataIndex: 'RoleName', key: 'RoleName', width: '15%', sorter: (a, b) => (a.RoleName || '').localeCompare(b.RoleName || '') },
    { title: 'Scope', dataIndex: 'ScopeName', key: 'ScopeName', width: '15%', sorter: (a, b) => (a.ScopeName || '').localeCompare(b.ScopeName || '') },
    { title: 'Application', dataIndex: 'ModuleCode', key: 'Application', width: '15%', render: (code) => moduleAppMap[code] || 'Unknown', sorter: (a, b) => (moduleAppMap[a.ModuleCode] || '').localeCompare(moduleAppMap[b.ModuleCode] || '') },
    { title: 'Module Name', dataIndex: 'ModuleName', key: 'ModuleName', width: '15%', sorter: (a, b) => (a.ModuleName || '').localeCompare(b.ModuleName || '') },
    { title: 'Created By', dataIndex: 'Created_User', key: 'Created_User', width: '15%', sorter: (a, b) => (a.Created_User || '').localeCompare(b.Created_User || '') },
    { title: 'Created On', dataIndex: 'CreatedDate', key: 'CreatedDate', width: '15%', sorter: (a, b) => new Date(a.CreatedDate || 0) - new Date(b.CreatedDate || 0), render: (date) => date ? dayjs(date).format('DD-MMM-YYYY') : '' },
    { title: 'Status', dataIndex: 'stActive', key: 'stActive', width: '10%', sorter: (a, b) => (a.stActive || '').localeCompare(b.stActive || '') },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <div className="flex gap-3">
          <Edit2 size={16} className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(record); }} />
          <Trash2 size={16} className="text-red-500 cursor-pointer hover:text-red-700" onClick={(e) => { e.stopPropagation(); showAlert('confirm', 'Confirm Delete', 'Are you sure you want to delete this mapping?', () => handleDeleteMapping(record.RolePermissionMappingId)); }} />
        </div>
      ),
    }
  ];

  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = (mapping.RoleName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (mapping.ModuleName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
                          
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = mapping.stActive === 'Active';
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = mapping.stActive === 'Inactive';
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <GlobalSubheader 
        title="Role Permission Mapping" 
        onAddClick={() => handleOpenDrawer()} 
        buttonText="New Mapping"
        searchPlaceholder="Search By: Role Name, Module Name"
        onSearch={(data) => setSearchQuery(data.value || '')}
      >
        <Radio.Group 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-medium text-gray-700"
        >
          <Radio value="ALL">ALL</Radio>
          <Radio value="ACTIVE">Active</Radio>
          <Radio value="INACTIVE">Inactive</Radio>
        </Radio.Group>
      </GlobalSubheader>
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-sm border border-[#e2e8f0] flex flex-col">
          <PremiumTable columns={columns} dataSource={filteredMappings} rowKey="RolePermissionMappingId" loading={loading} pagination={{ pageSize: 15 }} selectable={false} />
        </div>
      </div>

      <OverlayWidget
        title={isEditMode ? "Edit Role Permission Mapping" : "New Role Permission Mapping"}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        width="w-[70vw]"
        footer={
          <div className="flex justify-end gap-3 w-full p-4 border-t border-gray-200">
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" className="bg-blue-600" onClick={handleSaveMapping}>Save</Button>
          </div>
        }
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex gap-4 mb-6 shrink-0">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Select Role ({rolesList.length})</label>
              <Select className="w-full" placeholder="Select Role" value={selectedRole || undefined} onChange={setSelectedRole} disabled={isEditMode} showSearch optionFilterProp="children" getPopupContainer={trigger => trigger.parentNode}>
                {rolesList.map(r => <Option key={r.RoleCode} value={r.RoleCode}>{r.RoleName}</Option>)}
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Select Scope ({scopeList.length})</label>
              <Select className="w-full" placeholder="Select Scope" value={selectedScope || undefined} onChange={setSelectedScope} disabled={isEditMode} showSearch optionFilterProp="children" getPopupContainer={trigger => trigger.parentNode}>
                {scopeList.map(s => <Option key={s.ScopeCode} value={s.ScopeCode}>{s.ScopeName}</Option>)}
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Application Module</label>
              <Select className="w-full" placeholder="Select App" value={selectedApplicationCode || undefined} onChange={setSelectedApplicationCode} disabled={isEditMode} getPopupContainer={trigger => trigger.parentNode}>
                <Option value="KIT19">Management</Option>
                <Option value="Sales">Sales</Option>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">Select Module ({moduleList.length})</label>
              <Select className="w-full" placeholder="Select Module" value={selectedModule || undefined} onChange={setSelectedModule} disabled={isEditMode || !selectedApplicationCode} showSearch optionFilterProp="children" getPopupContainer={trigger => trigger.parentNode}>
                {moduleList.map(m => <Option key={m.ModuleCode} value={m.ModuleCode}>{m.ModuleNameTree || m.ModuleName}</Option>)}
              </Select>
            </div>
          </div>
          
          <div className="space-y-1 flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium text-gray-700 block mb-2">Permission List</label>
            <div className="border border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden bg-white">
              {isPermissionsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading permissions...</div>
              ) : (
                <div className="flex-1 overflow-x-auto overflow-y-auto border border-gray-200 rounded-lg m-2">
                  <table className="table-fixed text-left border-collapse bg-white" style={{ minWidth: '1850px' }}>
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="border-b border-r border-gray-200 px-4 py-2 w-[250px] bg-gray-50">
                          {/* Empty Top Left Cell */}
                        </th>
                        {PERMISSION_COLUMNS.map(col => (
                          <th key={col.key} className="border-b border-r border-gray-200 font-medium text-gray-700 w-[50px] bg-gray-50 p-0">
                            <div className="h-[150px] w-full flex flex-col justify-end items-center pb-2">
                              <div 
                                className="text-xs whitespace-nowrap tracking-wider text-gray-600" 
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                              >
                                {col.label}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th className="border-b border-r border-gray-200 px-4 py-3 font-medium text-gray-700 w-[250px] bg-gray-50 text-sm align-middle">
                          Model/Action
                        </th>
                        {PERMISSION_COLUMNS.map(col => (
                          <th key={`all_${col.key}`} className="border-b border-r border-gray-200 w-[50px] bg-gray-50 text-center py-3">
                            <Checkbox onChange={(e) => handleCheckAll(`Check_${col.key}`, e.target.checked)} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {permissions.length === 0 ? (
                        <tr>
                          <td colSpan={PERMISSION_COLUMNS.length + 1} className="text-center py-8">
                            <div>
                              <img src="/nodata.gif" alt="No Data Available" style={{ maxWidth: '250px', margin: '0 auto 10px auto', display: 'block' }} />
                              <div style={{ color: '#666', fontWeight: 500, fontSize: '15px' }}>
                                No permissions available or select options first.
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        permissions.map((perm, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                            <td className="border-r border-gray-100 px-4 py-3 text-sm text-gray-700 font-medium w-[250px] truncate">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                <span className="truncate" title={perm.ModuleName || perm.ModuleCode}>{perm.ModuleName || perm.ModuleCode}</span>
                              </div>
                            </td>
                            {PERMISSION_COLUMNS.map(col => (
                              <td key={col.key} className="border-r border-gray-100 text-center py-2 w-[50px]">
                                <Checkbox checked={perm[`Check_${col.key}`]} onChange={(e) => handlePermissionCheck(perm.ModuleCode, `Check_${col.key}`, e.target.checked)} />
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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

export default RolePermissionMapping;

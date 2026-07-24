import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Input, Select, Drawer, Table, Checkbox, Tag, Tooltip,
  Radio, Space, Spin, Badge
} from 'antd';
import {
  Plus, Search, Edit2, Trash2, Shield, Smartphone, Monitor,
  Eye, EyeOff, Lock, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import './PipelineSettings.css';

const { Option } = Select;
const BASE_URL = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

// ---- API Helper --------------------------------------------------------
const apiPost = async (endpoint, details, token) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Token: token, Details: JSON.stringify(details) }),
  });
  return res.json();
};

// ---- Visibility badge colours -----------------------------------------
const VISIBILITY_COLORS = {
  normal: '#52c41a',
  hidden: '#ff4d4f',
  masked: '#faad14',
  readonly: '#1890ff',
};

const VISIBILITY_ICONS = {
  normal: <Eye size={12} />,
  hidden: <EyeOff size={12} />,
  masked: <Lock size={12} />,
  readonly: <Lock size={12} />,
};

// -----------------------------------------------------------------------
const FieldMasking = () => {
  const navigate = useNavigate();
  const TokenId = "-2295521862261168"; // Hardcoded for dev environment
  const userId = parseInt(localStorage.getItem("USER_ID")) || 34594;
  const parentId = 0;
  const ParentId = parentId || userId;

  // Platform toggle: 'Web' | 'MobApp'
  const [platform, setPlatform] = useState('Web');
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);

  // Main list data
  const [mainList, setMainList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('Add'); // 'Add' | 'Edit'
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  // Platform inside the drawer (independent of main list filter)
  const [drawerPlatform, setDrawerPlatform] = useState('Web');

  // Form state inside drawer
  const [pageList, setPageList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [fieldRows, setFieldRows] = useState([]);
  const [selectAllInclude, setSelectAllInclude] = useState(false);
  const [selectAllExport, setSelectAllExport] = useState(false);

  // ---- Fetch main list -----------------------------------------------
  const fetchMainList = useCallback(async () => {
    setLoading(true);
    try {
      const ep = platform === 'Web'
        ? API_ENDPOINTS.FIELD_MASKING.GET_WEB_LIST
        : API_ENDPOINTS.FIELD_MASKING.GET_MOB_LIST;

      const data = await apiPost(ep, {
        Mode: 'SS', ParentId, draw: 0, start: 0, length: 1000,
        UserId: userId, FilterText: filterText,
      }, TokenId);

      if (data && data.data) {
        setMainList(Array.isArray(data.data) ? data.data : []);
      } else {
        setMainList([]);
      }
    } catch (err) {
      console.error('Error fetching main list:', err);
      setMainList([]);
    } finally {
      setLoading(false);
    }
  }, [platform, filterText, ParentId, TokenId, userId]);

  useEffect(() => { 
    setCurrentPage(1); // Reset page on platform switch
    fetchMainList(); 
  }, [platform]);

  // ---- Fetch pages dropdown (uses drawerPlatform) --------------------
  const fetchPages = useCallback(async (plat) => {
    const ep = plat === 'Web'
      ? API_ENDPOINTS.FIELD_MASKING.GET_WEB_PAGES
      : API_ENDPOINTS.FIELD_MASKING.GET_MOB_PAGES;
    try {
      const data = await apiPost(ep, { Mode: 'T' }, TokenId);
      if (data?.Status === 1 && Array.isArray(data.Details)) {
        setPageList(data.Details);
      }
    } catch (err) { console.error('fetchPages', err); }
  }, [TokenId]);

  // ---- Fetch roles dropdown -------------------------------------------
  const fetchRoles = useCallback(async () => {
    try {
      const data = await apiPost(API_ENDPOINTS.FIELD_MASKING.GET_ROLE_LIST, {
        Mode: 'S', UserId: userId,
      }, TokenId);
      if (data?.Status === 1 && Array.isArray(data.Details)) {
        setRoleList(data.Details);
      }
    } catch (err) { console.error('fetchRoles', err); }
  }, [TokenId, userId]);

  // ---- Fetch field rows for selected page (uses drawerPlatform) -------
  const fetchFieldsForPage = useCallback(async (pageCode, plat) => {
    if (!pageCode) { setFieldRows([]); return; }
    setDrawerLoading(true);
    try {
      const ep = plat === 'Web'
        ? API_ENDPOINTS.FIELD_MASKING.GET_WEB_FIELDS
        : API_ENDPOINTS.FIELD_MASKING.GET_MOB_FIELDS;

      const data = await apiPost(ep, {
        Mode: 'S', PageCode: pageCode, ParentId,
      }, TokenId);

      if (data?.Status === 1 && Array.isArray(data.Details)) {
        setFieldRows(data.Details.map(f => ({
          ...f,
          HiddenType: f.HiddenType || 'normal',
          IsExportAllow: f.IsExportAllow || false,
          IsIncluded: false,
        })));
        setSelectAllInclude(false);
        setSelectAllExport(false);
      }
    } catch (err) { console.error('fetchFieldsForPage', err); }
    finally { setDrawerLoading(false); }
  }, [ParentId, TokenId]);

  // ---- Handle drawer mode/platform change ---------------------------
  const handleDrawerPlatformChange = async (newPlat) => {
    setDrawerPlatform(newPlat);
    setSelectedPage(null);
    setFieldRows([]);
    setSelectAllInclude(false);
    setSelectAllExport(false);
    await fetchPages(newPlat);
  };

  // ---- Open Add drawer -----------------------------------------------
  const openAddDrawer = () => {
    const initPlat = platform; // inherit current main list platform
    setDrawerMode('Add');
    setDrawerPlatform(initPlat);
    setDrawerPlatform(platform);
    setSelectedPage(null);
    setSelectedRole(null);
    setSelectedApp(null);
    setFieldRows([]);
    setSelectAllInclude(false);
    setSelectAllExport(false);
    fetchPages(initPlat);
    fetchRoles();
    setDrawerOpen(true);
  };

  // ---- Open Edit drawer ----------------------------------------------
  const openEditDrawer = async (row) => {
    const editPlat = platform; // inherit from list context
    setDrawerMode('Edit');
    setDrawerMode('Edit');
    setEditRowId(row.PageHiddenFieldsId);
    setSelectedApp(null);
    setDrawerOpen(true);
    setSelectedPage(row.PageCode);
    setSelectedRole(row.RoleCode);
    setFieldRows([]);
    setSelectAllInclude(false);
    setSelectAllExport(false);

    await fetchPages(editPlat);
    await fetchRoles();
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const ep = editPlat === 'Web'
        ? API_ENDPOINTS.FIELD_MASKING.GET_WEB_ROW_BY_ID
        : API_ENDPOINTS.FIELD_MASKING.GET_MOB_ROW_BY_ID;

      const data = await apiPost(ep, {
        Mode: 'U', ParentId, PageHiddenFieldsId: row.PageHiddenFieldsId,
      }, TokenId);

      if (data?.Status === 1 && Array.isArray(data.Details) && data.Details.length > 0) {
        // The API returns the RoleCode and PageCode on the first field object
        const firstRow = data.Details[0];
        setSelectedPage(firstRow.PageCode || row.PageCode);
        setSelectedRole(firstRow.RoleCode || row.RoleCode);

        const rows = data.Details.map(f => ({
          ...f,
          HiddenType: f.HiddenType || 'normal',
          IsExportAllow: f.IsExportAllow === true || f.IsExportAllow === 'true',
          IsIncluded: f.HiddenType && f.HiddenType !== 'normal',
        }));
        setFieldRows(rows);
        setSelectAllInclude(rows.every(r => r.IsIncluded));
        setSelectAllExport(rows.every(r => r.IsExportAllow));
      }
    } catch (err) { console.error('openEditDrawer', err); }
    finally { setDrawerLoading(false); }
  };

  // ---- Handle page change in drawer ---------------------------------
  const handlePageChange = (val) => {
    setSelectedPage(val);
    if (drawerMode === 'Add') {
      fetchFieldsForPage(val, drawerPlatform);
    } else {
      fetchFieldsEditMode(val, drawerPlatform);
    }
  };

  const fetchFieldsEditMode = async (pageCode, plat) => {
    if (!pageCode) return;
    setDrawerLoading(true);
    try {
      const ep = plat === 'Web'
        ? API_ENDPOINTS.FIELD_MASKING.GET_WEB_FIELDS_EDIT
        : API_ENDPOINTS.FIELD_MASKING.GET_MOB_FIELDS;

      const data = await apiPost(ep, {
        Mode: 'E', PageCode: pageCode, ParentId, UserIds: '',
      }, TokenId);

      if (data?.Status === 1 && Array.isArray(data.Details)) {
        setFieldRows(data.Details.map(f => ({
          ...f,
          HiddenType: f.HiddenType || 'normal',
          IsExportAllow: f.IsExportAllow === true || f.IsExportAllow === 'true',
          IsIncluded: f.HiddenType && f.HiddenType !== 'normal',
        })));
      }
    } catch (err) { console.error('fetchFieldsEditMode', err); }
    finally { setDrawerLoading(false); }
  };

  // ---- Update a single field row ------------------------------------
  const updateFieldRow = (pageFieldId, key, value) => {
    setFieldRows(prev => prev.map(r =>
      r.PageFieldId === pageFieldId ? { ...r, [key]: value } : r
    ));
  };

  // ---- Select All logic ---------------------------------------------
  const handleSelectAllInclude = (checked) => {
    setSelectAllInclude(checked);
    setFieldRows(prev => prev.map(r => ({ ...r, IsIncluded: checked })));
  };

  const handleSelectAllExport = (checked) => {
    setSelectAllExport(checked);
    setFieldRows(prev => prev.map(r => ({ ...r, IsExportAllow: checked })));
  };

  // ---- Save / Update ------------------------------------------------
  const handleSave = async () => {
    if (!selectedPage) {
      Swal.fire('Validation', 'Please select a Page', 'warning'); return;
    }
    if (!selectedRole) {
      Swal.fire('Validation', 'Please select a Role', 'warning'); return;
    }

    const included = fieldRows.filter(r => r.IsIncluded || (r.HiddenType && r.HiddenType !== 'normal'));
    if (included.length === 0) {
      Swal.fire('Validation', 'Minimum 1 masked, hidden, or readonly field required.', 'warning');
      return;
    }

    try {
      let data;
      if (drawerPlatform === 'Web') {
        const payload = {
          Mode: drawerMode === 'Add' ? 'I' : 'P',
          ParentId,
          PageCode: selectedPage,
          RoleCode: selectedRole,
          transactions: included.map(f => ({
            PageFieldId: f.PageFieldId,
            HiddenType: f.HiddenType,
            IsExportAllow: f.IsExportAllow,
          })),
        };
        if (drawerMode === 'Edit') payload.PageHiddenFieldsId = editRowId;

        const ep = drawerMode === 'Add'
          ? API_ENDPOINTS.FIELD_MASKING.SAVE_WEB
          : API_ENDPOINTS.FIELD_MASKING.UPDATE_WEB;
        data = await apiPost(ep, payload, TokenId);
      } else {
        // Mobile
        const maskJson = JSON.stringify(included.map(f => ({
          HiddenType: f.HiddenType,
          IsExportAllow: f.IsExportAllow,
          FieldName: f.FieldName,
          TableName: f.TableName,
          FieldType: f.FieldType,
          ParentId,
        })));
        const payload = {
          Mode: drawerMode === 'Add' ? 'I' : 'P',
          PageCode: selectedPage,
          RoleCode: selectedRole,
          UserId: userId,
          MaskJson: maskJson,
        };
        if (drawerMode === 'Edit') payload.PageHiddenFieldsId = editRowId;

        const ep = drawerMode === 'Add'
          ? API_ENDPOINTS.FIELD_MASKING.SAVE_MOB
          : API_ENDPOINTS.FIELD_MASKING.UPDATE_MOB;
        data = await apiPost(ep, payload, TokenId);
      }

      if (data?.Details === 1 || data?.Status === 1) {
        Swal.fire('Success', `${drawerMode === 'Add' ? 'Saved' : 'Updated'} successfully!`, 'success');
        setDrawerOpen(false);
        fetchMainList();
      } else {
        Swal.fire('Error', data?.Message || 'Already exists or could not save.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'An unexpected error occurred.', 'error');
    }
  };

  // ---- Delete -------------------------------------------------------
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete this field masking configuration.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;

    try {
      const ep = platform === 'Web'
        ? API_ENDPOINTS.FIELD_MASKING.DELETE_WEB
        : API_ENDPOINTS.FIELD_MASKING.DELETE_MOB;

      const data = await apiPost(ep, {
        Mode: 'D', PageHiddenFieldsId: row.PageHiddenFieldsId,
      }, TokenId);

      Swal.fire('Deleted!', typeof data?.Details === 'string' ? data.Details : 'Deleted successfully.', 'success');
      fetchMainList();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete.', 'error');
    }
  };

  // ---- Main table columns -------------------------------------------
  const mainColumns = [
    {
      title: '#',
      width: 50,
      render: (_, __, idx) => <span style={{ color: '#888', fontSize: 13 }}>{(currentPage - 1) * 15 + idx + 1}</span>,
    },
    {
      title: 'Page',
      dataIndex: 'TableName',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'RoleName',
      render: (v) => <Tag color="blue">{v || '—'}</Tag>,
    },
    {
      title: 'Field List',
      dataIndex: 'FieldNames',
      render: (v) => {
        if (!v) return <span style={{ color: '#bbb' }}>—</span>;
        const fields = v.split(',').map(f => f.trim()).filter(Boolean);
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {fields.slice(0, 5).map((f, i) => (
              <Tag key={i} style={{ fontSize: 11 }}>{f}</Tag>
            ))}
            {fields.length > 5 && (
              <Tooltip title={fields.slice(5).join(', ')}>
                <Tag color="default">+{fields.length - 5} more</Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      width: 110,
      render: (_, row) => (
        <Space>
          <Button
            type="text"
            icon={<Edit2 size={15} />}
            style={{ color: '#1890ff' }}
            onClick={() => openEditDrawer(row)}
            title="Edit"
          />
          <Button
            type="text"
            icon={<Trash2 size={15} />}
            style={{ color: '#ff4d4f' }}
            onClick={() => handleDelete(row)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // ---- Field config table inside drawer ----------------------------
  const drawerFieldColumns = [
    {
      title: 'Field Name',
      dataIndex: 'DisplayName',
      render: (v) => <span style={{ fontWeight: 500 }}>{v || '—'}</span>,
    },
    {
      title: 'Visibility',
      dataIndex: 'HiddenType',
      width: 150,
      render: (val, row) => (
        <Select
          size="small"
          value={val || 'normal'}
          onChange={(v) => updateFieldRow(row.PageFieldId, 'HiddenType', v)}
          style={{ width: '100%' }}
        >
          {['normal', 'hidden', 'masked', 'readonly'].map(opt => (
            <Option key={opt} value={opt}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: VISIBILITY_COLORS[opt] }}>{VISIBILITY_ICONS[opt]}</span>
                {opt}
              </span>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Checkbox
            checked={selectAllExport}
            onChange={e => handleSelectAllExport(e.target.checked)}
          />
          Export Allow
        </div>
      ),
      dataIndex: 'IsExportAllow',
      width: 130,
      render: (val, row) => (
        <Checkbox
          checked={!!val}
          onChange={e => {
            updateFieldRow(row.PageFieldId, 'IsExportAllow', e.target.checked);
            setSelectAllExport(false);
          }}
        />
      ),
    },
    {
      title: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Checkbox
            checked={selectAllInclude}
            onChange={e => handleSelectAllInclude(e.target.checked)}
          />
          Include
        </div>
      ),
      dataIndex: 'IsIncluded',
      width: 100,
      render: (val, row) => (
        <Checkbox
          checked={!!val}
          onChange={e => {
            updateFieldRow(row.PageFieldId, 'IsIncluded', e.target.checked);
            setSelectAllInclude(false);
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={22} color="#1890ff" />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Page Field Masking</h1>
            <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
              Control field visibility, masking and export permissions per page and role
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={openAddDrawer}
          style={{ background: '#1890ff', borderColor: '#1890ff', fontWeight: 600 }}
        >
          Add Field Masking
        </Button>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px 24px',
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        {/* Platform radio */}
        <Radio.Group
          value={platform}
          onChange={e => { setPlatform(e.target.value); setFilterText(''); }}
          buttonStyle="solid"
        >
          <Radio.Button value="Web">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Monitor size={14} /> Web
            </span>
          </Radio.Button>
          <Radio.Button value="MobApp">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Smartphone size={14} /> MobApp
            </span>
          </Radio.Button>
        </Radio.Group>

        {/* Search */}
        <Input
          placeholder="Search by Page Name, PageCode..."
          prefix={<Search size={15} color="#bbb" />}
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          onPressEnter={fetchMainList}
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Button type="default" onClick={fetchMainList}>Search</Button>
      </div>

      {/* Main Table */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Table
          dataSource={mainList}
          columns={mainColumns}
          rowKey={(row, idx) => row.PageHiddenFieldsId || idx}
          loading={loading}
          pagination={{ current: currentPage, pageSize: 15, showSizeChanger: false }}
          onChange={(pagination) => setCurrentPage(pagination.current)}
          size="middle"
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#aaa' }}>
                <AlertCircle size={40} style={{ marginBottom: 8 }} />
                <div>No field masking configurations found.</div>
                <div style={{ marginTop: 8 }}>
                  <Button type="link" onClick={openAddDrawer}>Click here to add one</Button>
                </div>
              </div>
            )
          }}
        />
      </div>

      {/* ---- Add/Edit Drawer ---------------------------------------- */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={18} color="#1890ff" />
            <span>{drawerMode === 'Add' ? 'Add' : 'Edit'} Field Masking</span>
          </div>
        }
        placement="right"
        width={900}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        zIndex={1100}
        styles={{
          mask: { zIndex: 1099 },
          wrapper: { zIndex: 1100 },
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              style={{ background: '#1890ff', fontWeight: 600 }}
            >
              {drawerMode === 'Add' ? 'Save' : 'Update'}
            </Button>
          </div>
        }
      >
        <Spin spinning={drawerLoading}>
          {/* ---- Mode toggle inside drawer (like WebForm) ------------ */}
          <div style={{
            background: '#fafafa',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{ fontWeight: 600, color: '#555', minWidth: 50 }}>Mode</span>
            <Radio.Group
              value={drawerPlatform}
              onChange={e => handleDrawerPlatformChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="Web">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Monitor size={13} /> Web
                </span>
              </Radio.Button>
              <Radio.Button value="MobApp">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Smartphone size={13} /> Mobile
                </span>
              </Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {/* Application Dropdown */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>
                Select Application
              </label>
              <Select
                placeholder="--- Select Application ---"
                value={selectedApp}
                onChange={val => setSelectedApp(val)}
                style={{ width: '100%' }}
                disabled={drawerMode === 'Edit'}
              >
                <Option value="Sales">Sales</Option>
                <Option value="KIT19">Management</Option>
              </Select>
            </div>

            {/* Page Dropdown */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>
                Select Page <span style={{ color: 'red' }}>*</span>
              </label>
              <Select
                showSearch
                placeholder="--- Select Page ---"
                value={selectedPage}
                onChange={handlePageChange}
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {pageList.map(p => (
                  <Option key={p.PageCode} value={p.PageCode}>{p.TableName}</Option>
                ))}
              </Select>
            </div>

            {/* Role Dropdown */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>
                Select Role <span style={{ color: 'red' }}>*</span>
              </label>
              <Select
                showSearch
                placeholder="--- Select Role ---"
                value={selectedRole}
                onChange={val => setSelectedRole(val)}
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {roleList.map(r => (
                  <Option key={r.RoleCode} value={r.RoleCode}>{r.RoleName}</Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Fields Configuration Table */}
          {fieldRows.length > 0 ? (
            <>
              <div style={{
                background: '#f0f7ff',
                border: '1px solid #bae0ff',
                borderRadius: 8,
                padding: '10px 16px',
                marginBottom: 12,
                fontSize: 13,
                color: '#1890ff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertCircle size={15} />
                Check <strong>"Include"</strong> to apply a mask/visibility setting to that field.
                Fields left unchecked will keep their default visibility.
              </div>
              <Table
                dataSource={fieldRows}
                columns={drawerFieldColumns}
                rowKey="PageFieldId"
                pagination={false}
                size="small"
                scroll={{ y: 420 }}
                bordered
                rowClassName={(row) =>
                  row.IsIncluded || (row.HiddenType && row.HiddenType !== 'normal')
                    ? 'ant-table-row-selected'
                    : ''
                }
              />
            </>
          ) : selectedPage ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
              <Spin /> <span style={{ marginLeft: 8 }}>Loading fields...</span>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#bbb',
              border: '2px dashed #eee',
              borderRadius: 8,
            }}>
              <AlertCircle size={40} style={{ marginBottom: 8 }} />
              <div>Please select a Page to load fields</div>
            </div>
          )}
        </Spin>
      </Drawer>
    </div>
  );
};

export default FieldMasking;

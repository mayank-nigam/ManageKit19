import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Input, Select, Radio, Checkbox, Popconfirm, Form, Row, Col } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

const BASE_URL = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const apiPost = async (endpoint, details, token) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Token: token, Details: JSON.stringify(details) }),
  });
  return res.json();
};

const { Option } = Select;

const ModuleMaster = () => {
  const { TokenId, userId } = getSession();
  const Token = TokenId || "-2295521862261168";
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentModules, setParentModules] = useState([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('Add');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const typeValue = Form.useWatch('Type', form);
  
  const initForm = {
    ModuleId: 0,
    ModuleName: '',
    ModuleDescription: '',
    Type: 'Module',
    ParentModuleId: null, // use null for empty select
    URL: '#',
    Sequence: '',
    Title: '',
    Tag: [],
    StaticPath: '',
    IsInternal: false
  };
  
  const [currentModuleId, setCurrentModuleId] = useState(0);

  useEffect(() => {
    fetchModules();
    fetchParentModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await apiPost(API_ENDPOINTS.MODULE_MASTER.GET_LIST, { Mode: 'S' }, Token);
      if (response?.Status === 1 && Array.isArray(response.Details)) {
        setModules(response.Details);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentModules = async () => {
    try {
      const response = await apiPost(API_ENDPOINTS.MODULE_MASTER.GET_PARENT_MODULES, { Mode: 'SM' }, Token);
      if (response?.Status === 1 && Array.isArray(response.Details)) {
        setParentModules(response.Details);
      }
    } catch (error) {
      console.error("Error fetching parent modules:", error);
    }
  };

  const openAddDrawer = () => {
    setDrawerMode('Add');
    setCurrentModuleId(0);
    form.setFieldsValue(initForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (record) => {
    setDrawerMode('Edit');
    setCurrentModuleId(record.ModuleId);
    setDrawerOpen(true);
    
    try {
      // Pass Mode for getting details by ID (commonly 'E' for Edit or 'S' for Select)
      const response = await apiPost(API_ENDPOINTS.MODULE_MASTER.GET_BY_ID, { ModuleId: record.ModuleId, Mode: 'E' }, Token);
      if (response?.Status === 1 && response.Details) {
        const d = Array.isArray(response.Details) ? response.Details[0] : response.Details;
        if (d) {
          form.setFieldsValue({
          ModuleName: d.ModuleName || '',
          ModuleDescription: d.ModuleDescription || '',
          Type: d.Type || 'Module',
          ParentModuleId: d.ParentModuleId === 0 ? null : d.ParentModuleId,
          URL: d.URL || '#',
          Sequence: d.Sequence || '',
          Title: d.Title || '',
          Tag: d.Tag ? d.Tag.split(',').map(t => t.trim()).filter(Boolean) : [],
          StaticPath: d.StaticPath || '',
          IsInternal: d.IsInternal || false
        });
        }
      }
    } catch (error) {
      console.error("Error fetching module details:", error);
    }
  };

  const handleDelete = async (moduleId) => {
    try {
      const response = await apiPost(API_ENDPOINTS.MODULE_MASTER.DELETE, { ModuleId: moduleId, UserId: userId, Mode: 'D' }, Token);
      if (response?.Status === 1) {
        Swal.fire('Deleted!', 'Module has been deleted successfully.', 'success');
        fetchModules();
      } else {
        Swal.fire('Error', response?.Message || 'Failed to delete module.', 'error');
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      Swal.fire('Error', 'An error occurred while deleting.', 'error');
    }
  };

  const handleSave = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      Tag: Array.isArray(values.Tag) ? values.Tag.join(',') : (values.Tag || ''),
      ModuleId: currentModuleId,
      ParentModuleId: values.ParentModuleId || 0,
      UserId: userId,
      Mode: drawerMode === 'Add' ? 'I' : 'U'
    };
    
    try {
      const url = drawerMode === 'Add' ? API_ENDPOINTS.MODULE_MASTER.SAVE : API_ENDPOINTS.MODULE_MASTER.UPDATE;
      const response = await apiPost(url, payload, Token);
      
      if (response?.Status === 1) {
        Swal.fire('Success', `Module ${drawerMode === 'Add' ? 'created' : 'updated'} successfully.`, 'success');
        setDrawerOpen(false);
        fetchModules();
        fetchParentModules();
      } else {
        Swal.fire('Error', response?.Message || 'Failed to save module.', 'error');
      }
    } catch (error) {
      console.error("Error saving module:", error);
      Swal.fire('Error', 'An error occurred while saving.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Module Name',
      dataIndex: 'ModuleName',
      key: 'ModuleName',
      width: 150
    },
    {
      title: 'Description',
      dataIndex: 'ModuleDescription',
      key: 'ModuleDescription',
      width: 200
    },
    {
      title: 'Website URL',
      dataIndex: 'URL',
      key: 'URL',
      width: 150
    },
    {
      title: 'Parent Module',
      dataIndex: 'ModuleParentName',
      key: 'ModuleParentName',
      width: 150
    },
    {
      title: 'Mobile Path',
      dataIndex: 'StaticPath',
      key: 'StaticPath',
      width: 150
    },
    {
      title: 'Sequence',
      dataIndex: 'Sequence',
      key: 'Sequence',
      width: 80
    },
    {
      title: 'Created Details',
      key: 'CreatedDetails',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>Created By: {record.UserName || 'Admin'}</div>
          {record.CreatedDate && <div>Created On: {new Date(record.CreatedDate).toLocaleDateString('en-CA')}</div>}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'stActive',
      key: 'stActive',
      width: 80,
      render: (text) => (
        <span style={{ color: text?.toLowerCase() === 'active' ? 'green' : 'red' }}>
          {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Edit2 
            size={16} 
            color="#555" 
            style={{ cursor: 'pointer' }} 
            onClick={() => openEditDrawer(record)} 
          />
          <Popconfirm
            title="Delete this module?"
            onConfirm={() => handleDelete(record.ModuleId)}
            okText="Yes"
            cancelText="No"
          >
            <Trash2 size={16} color="red" style={{ cursor: 'pointer' }} />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontWeight: 600, color: '#333' }}>Module Master</h2>
        <Button type="primary" onClick={openAddDrawer} icon={<Plus size={16} />} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          Add Module
        </Button>
      </div>
      
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={modules}
          rowKey="ModuleId"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </div>

      <Drawer
        title={drawerMode === 'Add' ? 'New Module' : 'Edit Module'}
        width={750}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        mask={true}
        maskClosable={false}
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={initForm}
          onValuesChange={(changedValues) => {
            if (changedValues.Type !== undefined) {
              if (changedValues.Type === 'Module') {
                form.setFieldsValue({ URL: '#' });
              } else {
                form.setFieldsValue({ URL: '' });
              }
            }
          }}
        >
          <Row gutter={[32, 16]}>
            <Col span={12}>
              <Form.Item 
                name="ModuleName" 
                label="Module Name" 
                rules={[{ required: true, message: 'Please enter Module Name' }]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ModuleDescription" label="Module Description">
                <Input placeholder="Enter Description" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="Type" label="Type">
                <Radio.Group>
                  <Radio value="Module">Module</Radio>
                  <Radio value="Page">Page</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ParentModuleId" label="Select Parent Module">
                <Select 
                  showSearch
                  placeholder="Select" 
                  allowClear
                  optionFilterProp="children"
                >
                  {parentModules.map(p => (
                    <Option key={p.ModuleId} value={p.ModuleId}>{p.ModuleName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="URL" label="Website URL">
                <Input placeholder="e.g. #" disabled={typeValue === 'Module'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="Sequence" label="Sequence">
                <Input type="number" placeholder="Enter Sequence" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="Title" label="Title">
                <Input placeholder="Enter Title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="Tag" label="Tags">
                <Select mode="tags" placeholder="Enter Tags" tokenSeparators={[',']} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="StaticPath" label="Mobile Path">
                <Input placeholder="Enter Mobile Path" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[32, 16]}>
            <Col span={24}>
              <Form.Item name="IsInternal" valuePropName="checked">
                <Checkbox>Is Internal (True for Superadmin)</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()} loading={submitting}>Save</Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ModuleMaster;

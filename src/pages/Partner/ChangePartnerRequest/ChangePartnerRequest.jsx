import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Table, Dropdown, Modal, Input, Select, DatePicker, Radio, Tooltip, AutoComplete, Tabs } from 'antd';
import { MoreVertical, CheckCircle, XCircle, Send, Calendar, Search } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import EmptyState from '../shared/EmptyState';

import '../shared/PartnerCommon.css';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const STATUS_OPTIONS = [
  { label: 'All', value: -1 },
  { label: 'Requested', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Rejected', value: 2 },
  { label: 'Cancelled', value: 3 },
];

const STATUS_OPTIONS_RECEIVED = [
  { label: 'All', value: -1 },
  { label: 'Requested', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Rejected', value: 2 },
];

const STATUS_COLORS = {
  Requested: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  Approved: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  Cancelled: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
};

const StatusBadge = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Requested;
  return (
    <span
      className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {status}
    </span>
  );
};

const loadPartnerOptions = async (searchText) => {
  if (!searchText || searchText.length < 1) return [];
  try {
    const { token, userId, TokenId } = getSession();
    const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CHANGE_PARTNER_REQUEST.LOAD_PARTNER_LIST}`, {
      Token: token || TokenId,
      Details: { USERID: String(userId || ''), SearchText: searchText },
    });
    const list = res.data?.Details?.data || [];
    return list.map((item) => ({ value: item.User_Login, label: item.User_Login, raw: item }));
  } catch {
    return [];
  }
};

const PartnerAutocomplete = ({ value, onChange, placeholder }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const handleSearch = (val) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val || val.length < 1) { setOptions([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const opts = await loadPartnerOptions(val);
      setOptions(opts);
      setLoading(false);
    }, 300);
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      loading={loading}
      filterOption={false}
    />
  );
};

const UserAutocomplete = ({ value, onChange, placeholder }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const handleSearch = (val) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val || val.length < 1) { setOptions([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const opts = await loadPartnerOptions(val);
      setOptions(opts);
      setLoading(false);
    }, 300);
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      loading={loading}
      filterOption={false}
    />
  );
};

const FilterBar = ({ filters, onFilterChange, statusOptions, partnerLabel, onSearch }) => {
  const handleChange = (key, val) => {
    onFilterChange({ ...filters, [key]: val });
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar-fields">
        <div className="filter-field">
          <label className="filter-label">{partnerLabel}</label>
          <PartnerAutocomplete
            value={filters.partnerName}
            onChange={(val) => handleChange('partnerName', val)}
            placeholder="Search partner..."
          />
        </div>
        <div className="filter-field">
          <label className="filter-label">User</label>
          <UserAutocomplete
            value={filters.userName}
            onChange={(val) => handleChange('userName', val)}
            placeholder="Search user..."
          />
        </div>
        <div className="filter-field" style={{ minWidth: 280 }}>
          <label className="filter-label">Request Date</label>
          <DatePicker.RangePicker
            value={filters.dateRange}
            onChange={(dates) => handleChange('dateRange', dates)}
            style={{ width: '100%' }}
            format="DD-MMM-YYYY"
            presets={[
              { label: 'This Week', value: [dayjs().subtract(6, 'day'), dayjs()] },
              { label: 'Today', value: [dayjs(), dayjs()] },
              { label: 'Yesterday', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
              { label: 'Last 30 Days', value: [dayjs().subtract(29, 'day'), dayjs()] },
              { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
            ]}
          />
        </div>
        <div className="filter-field">
          <label className="filter-label">Status</label>
          <Select
            value={filters.status}
            onChange={(val) => handleChange('status', val)}
            options={statusOptions}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <Button
        type="primary"
        icon={<Search size={14} />}
        onClick={onSearch}
        className="search-btn"
      >
        Search
      </Button>
    </div>
  );
};

const ChangePartnerRequest = () => {
  const [activeTab, setActiveTab] = useState('sent');
  const [sentData, setSentData] = useState([]);
  const [receivedData, setReceivedData] = useState([]);
  const [sentTotal, setSentTotal] = useState(0);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [sentLoading, setSentLoading] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [sentPagination, setSentPagination] = useState({ current: 1, pageSize: 100 });
  const [receivedPagination, setReceivedPagination] = useState({ current: 1, pageSize: 100 });

  const [sentFilters, setSentFilters] = useState({
    partnerName: '', userName: '', dateRange: [dayjs().subtract(6, 'day'), dayjs()], status: -1,
  });
  const [receivedFilters, setReceivedFilters] = useState({
    partnerName: '', userName: '', dateRange: [dayjs().subtract(6, 'day'), dayjs()], status: -1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('approve');
  const [modalRecId, setModalRecId] = useState(0);
  const [modalRemarks, setModalRemarks] = useState('');

  const drawRef = useRef(0);
  const loadRecords = useCallback(async (option, filters, pagination, setData, setTotal, setLoading) => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      drawRef.current += 1;
      const details = {
        UserId: String(userId || ''),
        partnerId: 0,
        Fromdate: filters.dateRange?.[0]?.format('DD-MMM-YYYY') || '',
        Todate: filters.dateRange?.[1]?.format('DD-MMM-YYYY') || '',
        Metadata: '{}',
        Status: filters.status,
        Offset: (pagination.current - 1) * pagination.pageSize,
        Pagesize: pagination.pageSize,
        draw: drawRef.current,
        Option: option,
      };

      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CHANGE_PARTNER_REQUEST.GET_RECORDS}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: JSON.stringify(details),
      });

      const resData = res.data;
      if (resData && Array.isArray(resData.data)) {
        setData(resData.data);
        setTotal(resData.recordsTotal || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to load records', err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords(1, sentFilters, sentPagination, setSentData, setSentTotal, setSentLoading);
  }, [sentFilters, sentPagination, loadRecords]);

  useEffect(() => {
    loadRecords(2, receivedFilters, receivedPagination, setReceivedData, setReceivedTotal, setReceivedLoading);
  }, [receivedFilters, receivedPagination, loadRecords]);

  const handleSentSearch = () => setSentPagination((p) => ({ ...p, current: 1 }));
  const handleReceivedSearch = () => setReceivedPagination((p) => ({ ...p, current: 1 }));

  const handleAction = async (type, recId) => {
    let status, option, remarks;
    if (type === 'requestAgain') { status = 0; option = 3; remarks = 'Requested again'; }
    else if (type === 'cancel') { status = 3; option = 2; remarks = 'Cancelled'; }
    else return;

    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CHANGE_PARTNER_REQUEST.SAVE_ACTION}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { UserId: String(userId || ''), partnerId: 0, Status: status, Remarks: remarks, loginuserid: String(userId || ''), RecordID: recId, Option: option },
      });
      const msg = res.data?.Details?.data?.[0]?.Message || 'Action completed';
      Swal.fire({ icon: 'success', title: msg, timer: 2000, showConfirmButton: false });
      loadRecords(1, sentFilters, sentPagination, setSentData, setSentTotal, setSentLoading);
    } catch { Swal.fire('Error', 'Action failed.', 'error'); }
  };

  const openApproveRejectModal = (type, recId) => {
    setModalAction(type);
    setModalRecId(recId);
    setModalRemarks('');
    setModalOpen(true);
  };

  const handleSaveModal = async () => {
    const status = modalAction === 'approve' ? 1 : 2;
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CHANGE_PARTNER_REQUEST.SAVE_ACTION}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { UserId: '0', partnerId: 0, Status: status, Remarks: modalRemarks, loginuserid: String(userId || ''), RecordID: modalRecId, Option: 2 },
      });
      const msg = res.data?.Details?.data?.[0]?.Message || 'Action completed';
      Swal.fire({ icon: 'success', title: msg, timer: 2000, showConfirmButton: false });
      setModalOpen(false);
      loadRecords(2, receivedFilters, receivedPagination, setReceivedData, setReceivedTotal, setReceivedLoading);
    } catch { Swal.fire('Error', 'Action failed.', 'error'); }
  };

  const sentColumns = [
    {
      title: 'Request Date',
      dataIndex: 'RequestedDate',
      key: 'RequestedDate',
      width: '15%',
      sorter: (a, b) => (a.RequestedDate || '').localeCompare(b.RequestedDate || ''),
      render: (val) => (
        <span className="text-sm flex items-center gap-1.5">
          <Calendar size={13} className="text-gray-400" />{val}
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'RequestForUser',
      key: 'RequestForUser',
      width: '20%',
      sorter: (a, b) => (a.RequestForUser || '').localeCompare(b.RequestForUser || ''),
      render: (val) => <span className="text-sm font-medium">{val}</span>,
    },
    {
      title: 'To Partner',
      dataIndex: 'PartnerName',
      key: 'PartnerName',
      width: '20%',
      sorter: (a, b) => (a.PartnerName || '').localeCompare(b.PartnerName || ''),
      render: (val) => <span className="text-sm">{val}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      width: '12%',
      sorter: (a, b) => (a.Status || '').localeCompare(b.Status || ''),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Remarks',
      dataIndex: 'Remarks',
      key: 'Remarks',
      width: '23%',
      sorter: (a, b) => (a.Remarks || '').localeCompare(b.Remarks || ''),
      render: (val) => (
        <Tooltip title={val}>
          <span className="text-sm text-gray-500 truncate block max-w-[200px]">{val}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      fixed: 'right',
      sorter: false,
      render: (_, record) => {
        if (record.Status !== 'Requested') return null;
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'requestAgain', label: 'Request again', icon: <Send size={13} />, onClick: () => handleAction('requestAgain', record.RecID) },
                { key: 'cancel', label: 'Cancel request', icon: <XCircle size={13} />, danger: true, onClick: () => handleAction('cancel', record.RecID) },
              ],
            }}
            trigger={['click']}
          >
            <button type="button" className="action-btn">
              <MoreVertical size={16} />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const receivedColumns = [
    {
      title: 'Request Date',
      dataIndex: 'RequestedDate',
      key: 'RequestedDate',
      width: '15%',
      sorter: (a, b) => (a.RequestedDate || '').localeCompare(b.RequestedDate || ''),
      render: (val) => (
        <span className="text-sm flex items-center gap-1.5">
          <Calendar size={13} className="text-gray-400" />{val}
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'RequestForUser',
      key: 'RequestForUser',
      width: '20%',
      sorter: (a, b) => (a.RequestForUser || '').localeCompare(b.RequestForUser || ''),
      render: (val) => <span className="text-sm font-medium">{val}</span>,
    },
    {
      title: 'From Partner',
      dataIndex: 'FromPartner',
      key: 'FromPartner',
      width: '20%',
      sorter: (a, b) => (a.FromPartner || '').localeCompare(b.FromPartner || ''),
      render: (val) => <span className="text-sm">{val}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      width: '12%',
      sorter: (a, b) => (a.Status || '').localeCompare(b.Status || ''),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Remarks',
      dataIndex: 'Remarks',
      key: 'Remarks',
      width: '23%',
      sorter: (a, b) => (a.Remarks || '').localeCompare(b.Remarks || ''),
      render: (val) => (
        <Tooltip title={val}>
          <span className="text-sm text-gray-500 truncate block max-w-[200px]">{val}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      fixed: 'right',
      sorter: false,
      render: (_, record) => {
        if (record.Status !== 'Requested') return null;
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'approve', label: 'Approve', icon: <CheckCircle size={13} />, onClick: () => openApproveRejectModal('approve', record.RecID) },
                { key: 'reject', label: 'Reject', icon: <XCircle size={13} />, danger: true, onClick: () => openApproveRejectModal('reject', record.RecID) },
              ],
            }}
            trigger={['click']}
          >
            <button type="button" className="action-btn">
              <MoreVertical size={16} />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'sent',
      label: (
        <span className="tab-label">
          <Send size={14} />
          Change Requested
        </span>
      ),
      children: (
        <div>
          <div className="filter-section">
            <FilterBar
              filters={sentFilters}
              onFilterChange={setSentFilters}
              statusOptions={STATUS_OPTIONS}
              partnerLabel="To Partner"
              onSearch={handleSentSearch}
            />
          </div>
          <div className="partner-table-container">
            <Table
            rowKey="RecID"
            columns={sentColumns}
            dataSource={sentData}
            loading={sentLoading}
            pagination={{
              ...sentPagination,
              total: sentTotal,
              showSizeChanger: false,
              pageSizeOptions: ['100'],
              showTotal: (total) => <span className="total-record">Total {total} records</span>,
            }}
            onChange={(p) => setSentPagination({ current: p.current, pageSize: p.pageSize })}
            scroll={{ x: 1100 }}
            locale={{ emptyText: <EmptyState message="No record found." /> }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'received',
      label: (
        <span className="tab-label">
          <CheckCircle size={14} />
          Change Received
        </span>
      ),
      children: (
        <div>
          <div className="filter-section">
            <FilterBar
              filters={receivedFilters}
              onFilterChange={setReceivedFilters}
              statusOptions={STATUS_OPTIONS_RECEIVED}
              partnerLabel="From Partner"
              onSearch={handleReceivedSearch}
            />
          </div>
          <div className="partner-table-container">
            <Table
              rowKey="RecID"
              columns={receivedColumns}
              dataSource={receivedData}
              loading={receivedLoading}
              pagination={{
                ...receivedPagination,
                total: receivedTotal,
                showSizeChanger: false,
                pageSizeOptions: ['100'],
                showTotal: (total) => <span className="total-record">Total {total} records</span>,
              }}
              onChange={(p) => setReceivedPagination({ current: p.current, pageSize: p.pageSize })}
              scroll={{ x: 1100 }}
              locale={{ emptyText: <EmptyState message="No record found." /> }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="change-partner-request-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Change Partner Requests</h1>
          <p className="page-subtitle">Manage inter-partner user transfer requests.</p>
        </div>
      </div>

      <div className="main-card">
        <div className="tabs-container">
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
      </div>

      <Modal
        title="Approve/Reject Request"
        open={modalOpen}
        onOk={handleSaveModal}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        cancelText="Close"
        okButtonProps={{ className: 'save-btn' }}
        closable
        maskClosable={false}
        keyboard={false}
      >
        <div className="modal-content">
          <Radio.Group
            value={modalAction}
            onChange={(e) => setModalAction(e.target.value)}
            className="radio-group"
          >
            <Radio value="approve">Approve Request</Radio>
            <Radio value="reject" className="ml-4">Reject Request</Radio>
          </Radio.Group>
          <div>
            <label className="modal-label">Remarks (Optional)</label>
            <Input.TextArea
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
              placeholder="Enter remarks"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChangePartnerRequest;

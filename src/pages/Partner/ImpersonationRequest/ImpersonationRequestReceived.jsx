import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, DatePicker, Input } from 'antd';
import { Search, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

import ImpersonationGrid from './components/ImpersonationGrid';
import ApproveRejectModal from './components/ApproveRejectModal';

import '../shared/PartnerCommon.css';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const STATUS_OPTIONS = [
  { label: 'All', value: -1 },
  { label: 'Requested', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Rejected', value: 2 },
];

const ImpersonationRequestReceived = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromPartner: '',
    user: '',
    dateRange: [dayjs().subtract(6, 'day'), dayjs()],
    status: -1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('approve');
  const [selectedRecId, setSelectedRecId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.IMPERSONATION_REQUEST.GET_LIST}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: {
          USERID: String(userId || ''),
          RequestedFor: 0,
          RequestedTo: 0,
          FromDate: filters.dateRange?.[0]?.format('DD-MMM-YYYY') || '',
          ToDate: filters.dateRange?.[1]?.format('DD-MMM-YYYY') || '',
          Status: filters.status,
          Offset: 0,
          PageSize: 100,
          Draw: 1,
          Option: 2,
        },
      });

      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      setRequests(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = () => {
    fetchRequests();
  };

  const handleRefresh = () => {
    setFilters({
      fromPartner: '',
      user: '',
      dateRange: [dayjs().subtract(6, 'day'), dayjs()],
      status: -1,
    });
  };

  const handleApproveReject = (recId, action) => {
    setSelectedRecId(recId);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleSaveAction = async (remarks) => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.IMPERSONATION_REQUEST.APPROVE_REJECT}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: {
          USERID: String(userId || ''),
          ReqType: modalAction === 'approve' ? 1 : 2,
          RecordId: selectedRecId,
          Remarks: remarks,
        },
      });

      const data = res.data?.Details?.data;
      if (data && data[0]?.Message) {
        Swal.fire({ icon: 'success', title: data[0].Message, timer: 2000, showConfirmButton: false });
        setModalOpen(false);
        fetchRequests();
      } else {
        Swal.fire('Info', 'Action completed', 'info');
        setModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      console.error('Failed to save action:', err);
      Swal.fire('Error', 'Failed to perform action', 'error');
    }
  };

  return (
    <div className="impersonation-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Impersonation Request Received</h1>
          <p className="page-subtitle">Manage incoming impersonation requests from partners.</p>
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-fields">
          <div className="filter-field">
            <label className="filter-label">From Partner</label>
            <Input
              value={filters.fromPartner}
              onChange={(e) => setFilters((f) => ({ ...f, fromPartner: e.target.value }))}
              placeholder="Search partner..."
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">User</label>
            <Input
              value={filters.user}
              onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
              placeholder="Search user..."
              className="filter-input"
            />
          </div>
          <div className="filter-field filter-field-date">
            <label className="filter-label">Request Date</label>
            <DatePicker.RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters((f) => ({ ...f, dateRange: dates }))}
              format="DD-MMM-YYYY"
              presets={[
                { label: 'This Week', value: [dayjs().subtract(6, 'day'), dayjs()] },
                { label: 'Today', value: [dayjs(), dayjs()] },
                { label: 'Yesterday', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
                { label: 'Last 30 Days', value: [dayjs().subtract(29, 'day'), dayjs()] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              ]}
              style={{ width: '100%' }}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Status</label>
            <Select
              value={filters.status}
              onChange={(val) => setFilters((f) => ({ ...f, status: val }))}
              options={STATUS_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>
          <Button
            type="primary"
            icon={<Search size={14} />}
            onClick={handleSearch}
            className="search-btn"
          >
            Search
          </Button>
        </div>
      </div>

      <div className="table-card">
        <ImpersonationGrid
          data={requests}
          loading={loading}
          onApproveReject={handleApproveReject}
        />
      </div>

      <ApproveRejectModal
        open={modalOpen}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAction}
      />
    </div>
  );
};

export default ImpersonationRequestReceived;

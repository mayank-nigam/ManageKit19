import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from 'antd';
import { Download } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import RefreshButton from '../shared/RefreshButton';
import { formatDateToDDMmmYYYY } from '../ManageUser/utils/formatDate';

import SnapshotFilterBar from './components/SnapshotFilterBar';
import SnapshotGrid from './components/SnapshotGrid';

import '../shared/PartnerCommon.css';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const SnapshotList = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const drawRef = useRef(0);

  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      drawRef.current += 1;
      const payload = {
        Token: token || TokenId,
        UserId: String(userId || ''),
        SearchText: search,
        start: (pagination.current - 1) * pagination.pageSize,
        length: pagination.pageSize,
        draw: drawRef.current,
      };

      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.SNAPSHOTS.GET_LIST_BY_USER_ID}`,
        payload
      );

      const resData = res.data;
      if (resData && Array.isArray(resData.data)) {
        setSnapshots(resData.data);
        setTotal(resData.recordsTotal || 0);
      } else {
        setSnapshots([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to load snapshots', err);
      setSnapshots([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const handleSearch = (value) => {
    setSearch(value);
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleTableChange = (paginationConfig) => {
    setPagination({ current: paginationConfig.current, pageSize: paginationConfig.pageSize });
  };

  const handleExport = async () => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.SNAPSHOTS.GET_LIST}`,
        {
          Token: token || TokenId,
          UserId: String(userId || ''),
          SearchText: search,
        }
      );

      const data = res.data;
      const exportRows = data?.data || data?.Details || [];
      if (!exportRows || exportRows.length === 0) {
        Swal.fire('Info', 'No data available to export!', 'info');
        return;
      }

      const excludeFields = [
        'id', 'totalrow', 'srno', 'snapshotmoduleid', 'isdeleted',
        'deletedon', 'createdby', 'mobileno', 'emailid', 'guid', 'url',
      ];

      const rows = exportRows.map((detail) => {
        const filtered = {};
        Object.keys(detail).forEach((key) => {
          if (!excludeFields.includes(key.toLowerCase())) {
            filtered[key] = key.toLowerCase() === 'createdon' ? formatDateToDDMmmYYYY(detail[key]) : detail[key];
          }
        });
        filtered.Url = `${baseUrl}/UserCRMCampaign/snapshot/SnapshotSetting.aspx?SnapshotId=${detail.Guid}`;
        return filtered;
      });

      const header = Object.keys(rows[0] || {});
      const csvRows = rows.map((r) =>
        header.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const csv = [header.join(','), ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SnapshotList.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      Swal.fire('Error', 'Failed to fetch data for export.', 'error');
    }
  };

  return (
    <div className="snapshot-list-container p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Snapshot</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage snapshots created by users under your partner account.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<Download size={15} />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <SnapshotFilterBar search={search} onSearch={handleSearch} />
        </div>
        <RefreshButton onRefresh={loadSnapshots} title="Refresh list" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <SnapshotGrid
          snapshots={snapshots}
          loading={loading}
          pagination={{ ...pagination, total, showSizeChanger: true }}
          onTableChange={handleTableChange}
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
};

export default SnapshotList;

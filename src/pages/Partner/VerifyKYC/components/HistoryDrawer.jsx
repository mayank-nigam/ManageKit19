import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Spin } from 'antd';
import { User, Calendar } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const HistoryDrawer = ({ open, row, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [kycSettings, setKycSettings] = useState({});

  const fetchDocumentTypes = useCallback(async () => {
    try {
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.VERIFY_KYC.GET_DOCUMENT_TYPES}`);
      if (res.data?.Details) {
        setKycSettings(res.data.Details);
      }
    } catch (err) {
      console.error('Failed to fetch document types:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async (id) => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.VERIFY_KYC.GET_DOCUMENTS_BY_ID}`, {
        UserId: String(userId || ''),
        Id: id,
      });

      if (res.data?.Details) {
        const docs = Array.isArray(res.data.Details) ? res.data.Details : [];
        setDocuments(docs.map((d, i) => ({ ...d, key: d.Id || i })));
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && row) {
      fetchDocumentTypes();
      fetchDocuments(row.Id);
    }
  }, [open, row, fetchDocumentTypes, fetchDocuments]);

  const getDocTypeName = (id) => {
    const types = kycSettings?.documentTypes || [];
    const found = types.find((t) => t.Id === id);
    return found?.Name || '-';
  };

  const getDocSubTypeName = (id) => {
    const subTypes = kycSettings?.documentSubTypes || [];
    const found = subTypes.find((t) => t.Id === id);
    return found?.Name || '-';
  };

  const getHistoryStatusClass = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  const handleClose = () => {
    setDocuments([]);
    onClose();
  };

  return (
    <Drawer
      title="Document List History"
      placement="right"
      width={950}
      open={open}
      onClose={handleClose}
      className="verify-kyc-drawer"
    >
      <div className="user-info-header">
        <User size={18} className="user-info-header-icon" />
        <span>User Login: {row?.ParentUserLogin || '-'}</span>
      </div>

      <Spin spinning={loading}>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Document Sub Type</th>
              <th>Created On</th>
              <th>Approver</th>
              <th>Created By</th>
              <th>Status Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  No history records found
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.key}>
                  <td>{getDocTypeName(doc.DocumentTypeId)}</td>
                  <td>{getDocSubTypeName(doc.DocumentSubTypeId)}</td>
                  <td>
                    <span className="cell-date">
                      <Calendar size={13} className="cell-date-icon" />
                      {formatDateToDDMmmYYYY(doc.CreatedOn) || '-'}
                    </span>
                  </td>
                  <td>{doc.Approver || '-'}</td>
                  <td>{doc.CreatedBy || '-'}</td>
                  <td>
                    <span className="cell-date">
                      <Calendar size={13} className="cell-date-icon" />
                      {formatDateToDDMmmYYYY(doc.StatusDate) || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`history-status-badge ${getHistoryStatusClass(doc.DocStatus || doc.Status)}`}>
                      {doc.DocStatus || doc.Status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Spin>
    </Drawer>
  );
};

export default HistoryDrawer;

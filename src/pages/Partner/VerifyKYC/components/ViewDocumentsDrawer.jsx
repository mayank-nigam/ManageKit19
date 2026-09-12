import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Modal, Select, Input, Spin, message } from 'antd';
import { User, Paperclip, Download, CheckCircle, XCircle, Send } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');
const DOCS_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:805/'
  : 'https://docs.kit19.com/';

const ViewDocumentsDrawer = ({ open, row, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [kycSettings, setKycSettings] = useState({});

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionDoc, setActionDoc] = useState(null);
  const [actionStatus, setActionStatus] = useState('approved');
  const [actionRemarks, setActionRemarks] = useState('');

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

  const getDocumentSrc = (parentId, fileName) => {
    return `${DOCS_BASE_URL}KycDocument/${parentId}/${fileName}`;
  };

  const handleApproveReject = (doc) => {
    setActionDoc(doc);
    setActionStatus('approved');
    setActionRemarks('');
    setActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!actionRemarks.trim()) {
      Swal.fire('Validation Error', 'Please enter remarks', 'warning');
      return;
    }

    try {
      const { token, userId, TokenId } = getSession();
      const payload = [
        {
          Id: actionDoc.DocumentId || actionDoc.Id,
          ParentId: actionDoc.ParentId,
          Status: actionStatus,
          Remarks: actionRemarks,
        },
      ];

      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.VERIFY_KYC.KYC_OPERATION}`, {
        Mode: 'VERIFY-KYC',
        Payload: JSON.stringify(payload),
        KYCId: row?.Id || 0,
        UserId: String(userId || ''),
      });

      const details = res.data?.Details;
      if (details?.Id === 200) {
        Swal.fire('Success', details.Code || 'Document verified successfully', 'success');
        setActionModalOpen(false);
        fetchDocuments(row.Id);
        onSuccess();
      } else {
        Swal.fire('Error', details?.Code || 'Failed to verify document', 'error');
      }
    } catch (err) {
      console.error('Failed to verify document:', err);
      Swal.fire('Error', 'Failed to verify document. Please try again.', 'error');
    }
  };

  const getDocStatusClass = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    if (s === 'submitted') return 'submitted';
    return 'pending';
  };

  const handleClose = () => {
    setDocuments([]);
    onClose();
  };

  return (
    <>
      <Drawer
        title="View Document List"
        placement="right"
        width={900}
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
                <th>Document</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const docSrc = getDocumentSrc(doc.ParentId, doc.FileName);
                  const isProcessed = ['approved', 'rejected'].includes(
                    (doc.DocStatus || doc.Status || '').toLowerCase()
                  );

                  return (
                    <tr key={doc.key}>
                      <td>{getDocTypeName(doc.DocumentTypeId)}</td>
                      <td>{getDocSubTypeName(doc.DocumentSubTypeId)}</td>
                      <td>
                        <div className="doc-link">
                          <Paperclip size={13} className="doc-link-icon" />
                          <a href={docSrc} target="_blank" rel="noopener noreferrer">
                            {doc.FileName || docSrc}
                          </a>
                          <a
                            href={docSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-link-download"
                            title="Download"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className={`doc-status ${getDocStatusClass(doc.DocStatus || doc.Status)}`}>
                          {doc.DocStatus || doc.Status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="doc-remarks" title={doc.Remarks}>
                          {doc.Remarks || '-'}
                        </span>
                      </td>
                      <td>
                        {!isProcessed ? (
                          <div className="doc-action-btns">
                            <button
                              className="doc-action-btn approve"
                              onClick={() => handleApproveReject({ ...doc, Status: 'approved' })}
                            >
                              <CheckCircle size={12} />
                              Approve
                            </button>
                            <button
                              className="doc-action-btn reject"
                              onClick={() => handleApproveReject({ ...doc, Status: 'rejected' })}
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: 12 }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Spin>
      </Drawer>

      <Modal
        title="View Document"
        open={actionModalOpen}
        onCancel={() => setActionModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setActionModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="apply"
            type="primary"
            loading={saving}
            onClick={handleActionSubmit}
            style={{ background: '#2a9629', borderColor: '#2a9629' }}
          >
            Apply
          </Button>,
        ]}
        className="preview-modal"
        width={600}
      >
        {actionDoc && (
          <div>
            <div className="preview-box">
              {(() => {
                const src = getDocumentSrc(actionDoc.ParentId, actionDoc.FileName);
                const fileType = actionDoc.ContentType || '';
                if (fileType.startsWith('image/')) {
                  return <img src={src} alt="Preview" />;
                } else if (fileType === 'application/pdf') {
                  return <embed src={src} type="application/pdf" />;
                }
                return <p>Preview not available for this file type</p>;
              })()}
            </div>

            <div className="preview-actions">
              <div>
                <div className="preview-field-label">Status</div>
                <Select
                  value={actionStatus}
                  onChange={setActionStatus}
                  style={{ width: '100%' }}
                  options={[
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                  ]}
                />
              </div>
              <div>
                <div className="preview-field-label">Remarks</div>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter Remarks"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="preview-textarea"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ViewDocumentsDrawer;

import React, { useState, useEffect } from 'react';
import { Modal, Radio, Input, Button } from 'antd';
import { Send } from 'lucide-react';

const ApproveRejectModal = ({ open, action, onClose, onSave }) => {
  const [radioValue, setRadioValue] = useState('approve');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRadioValue(action);
      setRemarks('');
    }
  }, [open, action]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(remarks);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Approve/Reject Request"
      open={open}
      onCancel={onClose}
      footer={
        <div className="modal-footer-custom">
          <Button onClick={onClose} className="cancel-btn">
            Close
          </Button>
          <Button
            type="primary"
            icon={<Send size={14} />}
            loading={saving}
            onClick={handleSave}
            className="save-btn"
          >
            Save
          </Button>
        </div>
      }
      closable
      maskClosable={false}
      keyboard={false}
      className="approve-reject-modal"
    >
      <div className="modal-content-custom">
        <div className="modal-field">
          <Radio.Group
            value={radioValue}
            onChange={(e) => setRadioValue(e.target.value)}
            className="action-radio-group"
          >
            <Radio value="approve" className="radio-option approve">
              <CheckCircle size={16} />
              Approve Request
            </Radio>
            <Radio value="reject" className="radio-option reject">
              <XCircle size={16} />
              Reject Request
            </Radio>
          </Radio.Group>
        </div>
        <div className="modal-field">
          <label className="modal-label">Remarks (Optional)</label>
          <Input.TextArea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks"
            rows={3}
            className="remarks-textarea"
          />
        </div>
      </div>
    </Modal>
  );
};

const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default ApproveRejectModal;

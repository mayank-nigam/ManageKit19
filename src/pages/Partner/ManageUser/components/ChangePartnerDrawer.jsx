import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button } from 'antd';
import Swal from 'sweetalert2';

const { TextArea } = Input;

const ChangePartnerDrawer = ({ open, user, onClose, onSave }) => {
  const [partnerId, setPartnerId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPartnerId('');
      setRemarks('');
      setError('');
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = async () => {
    if (!partnerId.trim()) {
      setError('Partner ID is required');
      return;
    }

    setSaving(true);
    const res = await onSave(user.id, { partnerId, remarks });
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to send request.', 'error');
    }
  };

  return (
    <Drawer
      title="Change partner request"
      open={open}
      onClose={onClose}
      width={480}
      className="manage-user-drawer"
      footer={
        <div className="flex justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" className="bg-green-600 hover:bg-green-700 border-green-600" loading={saving} onClick={handleSave}>
            Request
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Partner ID</label>
          <Input
            placeholder="Enter partner id"
            value={partnerId}
            onChange={(e) => { setPartnerId(e.target.value); setError(''); }}
            status={error ? 'error' : ''}
          />
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <TextArea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        <div className="bg-sky-50 border border-sky-100 text-sky-700 text-sm rounded-lg p-3">
          Your request will be sent to the partner, whom the user is to be transferred. Once the
          partner accepts the request, the user will be transferred.
        </div>
      </div>
    </Drawer>
  );
};

export default ChangePartnerDrawer;

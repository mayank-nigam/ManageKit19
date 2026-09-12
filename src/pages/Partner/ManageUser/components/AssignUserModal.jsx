import React, { useState, useEffect } from 'react';
import { Drawer, Select, Button } from 'antd';
import Swal from 'sweetalert2';
import { mockTeamMembers } from '../mockData/mockUsers';

// Renders as a right-side Drawer (not a centered Modal) to match the legacy page's
// "Assign User" overlay, which is a full-height slide-in panel exactly like Update
// Subscription / Snapshot / Upgrade User / Change Partner - keeping all five overlays
// visually consistent.
const AssignUserModal = ({ open, user, onClose, onSave }) => {
  const [teamMemberId, setTeamMemberId] = useState(mockTeamMembers[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Default to the first real team member - not a sentinel value that can
      // never occur. The legacy page's "-1" required-field check was dead code
      // because the dropdown could never actually hold -1; defaulting to (and
      // validating against) a real id avoids that class of bug entirely.
      setTeamMemberId(mockTeamMembers[0]?.id ?? null);
      setError('');
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = async () => {
    if (!teamMemberId) {
      setError('Please select a team member');
      return;
    }
    const member = mockTeamMembers.find((m) => m.id === teamMemberId);

    setSaving(true);
    const res = await onSave(user.id, teamMemberId, member?.name || '');
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to assign user.', 'error');
    }
  };

  return (
    <Drawer
      title="Assign User"
      open={open}
      onClose={onClose}
      width={420}
      className="manage-user-drawer"
      footer={
        <div className="flex justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" className="bg-green-600 hover:bg-green-700 border-green-600" loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assign User</label>
        <Select
          value={teamMemberId}
          onChange={(v) => { setTeamMemberId(v); setError(''); }}
          style={{ width: '100%' }}
          status={error ? 'error' : ''}
          options={mockTeamMembers.map((m) => ({ label: m.name, value: m.id }))}
        />
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    </Drawer>
  );
};

export default AssignUserModal;

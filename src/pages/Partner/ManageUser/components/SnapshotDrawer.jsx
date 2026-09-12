import React, { useState, useEffect } from 'react';
import { Drawer, Input, Select, Button } from 'antd';
import Swal from 'sweetalert2';
import { mockModules } from '../mockData/mockUsers';

const SnapshotDrawer = ({ open, user, onClose, onSave }) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setSnapshotName('');
      setModules([]);
      setErrors({});
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = async () => {
    const nextErrors = {};
    if (!snapshotName.trim()) nextErrors.snapshotName = 'Snapshot name is required';
    if (modules.length === 0) nextErrors.modules = 'Select at least one module';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const res = await onSave(user.id, { snapshotName, modules });
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to create snapshot.', 'error');
    }
  };

  return (
    <Drawer
      title="Snapshot Account"
      open={open}
      onClose={onClose}
      width={480}
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
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Snapshot Name</label>
          <Input
            placeholder="Enter Snapshot Name"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            status={errors.snapshotName ? 'error' : ''}
          />
          {errors.snapshotName && <div className="text-xs text-red-500 mt-1">{errors.snapshotName}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modules</label>
          <Select
            mode="multiple"
            placeholder="Select Modules"
            value={modules}
            onChange={setModules}
            style={{ width: '100%' }}
            status={errors.modules ? 'error' : ''}
            options={mockModules.map((m) => ({ label: m, value: m }))}
          />
          {errors.modules && <div className="text-xs text-red-500 mt-1">{errors.modules}</div>}
        </div>
      </div>
    </Drawer>
  );
};

export default SnapshotDrawer;

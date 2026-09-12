import React, { useState, useEffect } from 'react';
import { Drawer, Radio, Button } from 'antd';
import { Shield, ShieldCheck, Crown } from 'lucide-react';
import Swal from 'sweetalert2';
import { PARTNER_TYPE } from '../mockData/mockUsers';

const TIER_OPTIONS = [
  { value: PARTNER_TYPE.BRONZE, label: 'Bronze Partner', icon: Shield },
  { value: PARTNER_TYPE.SILVER, label: 'Silver Partner', icon: ShieldCheck },
  { value: PARTNER_TYPE.GOLD, label: 'Gold Partner', icon: Crown },
];

const UpgradeUserDrawer = ({ open, user, onClose, onSave }) => {
  const [tier, setTier] = useState(PARTNER_TYPE.BRONZE);
  const [impersonation, setImpersonation] = useState('on-demand');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      // Default to one tier above the user's current tier where possible, otherwise Bronze.
      setTier(user.partnerType ? Math.min(user.partnerType + 1, PARTNER_TYPE.GOLD) : PARTNER_TYPE.BRONZE);
      setImpersonation('on-demand');
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    const res = await onSave(user.id, { partnerType: tier, impersonation });
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to upgrade user.', 'error');
    }
  };

  return (
    <Drawer
      title="Upgrade User"
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
      <div className="space-y-6">
        <Radio.Group value={tier} onChange={(e) => setTier(e.target.value)} className="flex gap-4 flex-wrap">
          {TIER_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Radio key={value} value={value} className="flex items-center">
              <span className="inline-flex items-center gap-1.5">
                <Icon size={15} className="text-gray-500" />
                {label}
              </span>
            </Radio>
          ))}
        </Radio.Group>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Allow impersonation</div>
          <Radio.Group value={impersonation} onChange={(e) => setImpersonation(e.target.value)}>
            <Radio value="permanent">Permanent</Radio>
            <Radio value="on-demand">On Demand</Radio>
          </Radio.Group>
        </div>
      </div>
    </Drawer>
  );
};

export default UpgradeUserDrawer;

import React, { useState, useEffect } from 'react';
import { Drawer, InputNumber, Button } from 'antd';
import { MessageSquare, Mail, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';
import { getPartnerSelf } from '../mockData/mockUserApi';

const CONFIG = {
  sms: { title: 'Add Sms Credit', icon: MessageSquare, balanceKey: 'smsBalance', color: 'text-emerald-500' },
  mail: { title: 'Add Mail Credit', icon: Mail, balanceKey: 'mailBalance', color: 'text-sky-500' },
  wallet: { title: 'Add Wallet Money', icon: Wallet, balanceKey: 'walletBalance', color: 'text-violet-500' },
};

const CreditDrawer = ({ open, user, creditType, onClose, onSave }) => {
  const [amount, setAmount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(null);
      setError('');
    }
  }, [open, user, creditType]);

  if (!user || !creditType) return null;

  const cfg = CONFIG[creditType];
  const Icon = cfg.icon;
  const yourBalance = getPartnerSelf()[cfg.balanceKey];
  const userBalance = user[cfg.balanceKey];

  const amt = Number(amount) || 0;
  const yourBalanceAfter = amount ? yourBalance - amt : 0;
  const userBalanceAfter = amount ? userBalance + amt : 0;

  const handleSave = async () => {
    if (!amount || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }
    // Peer-to-child transfer model: you cannot send more than your own pool holds.
    // This check isn't in the legacy page - adding it here since it's the only
    // sensible behavior for a balance-transfer form, not a copy of legacy logic.
    if (amt > yourBalance) {
      setError('Amount exceeds your available balance');
      return;
    }

    setSaving(true);
    const res = await onSave(user.id, creditType, amt);
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to add credit.', 'error');
    }
  };

  return (
    <Drawer
      title={
        <span className="inline-flex items-center gap-2">
          <Icon size={16} className={cfg.color} /> {cfg.title}
        </span>
      }
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
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-400">Your Balance</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{yourBalance}</div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-400">User Balance</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{userBalance}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <InputNumber
            min={0}
            value={amount}
            onChange={(v) => { setAmount(v); setError(''); }}
            style={{ width: '100%' }}
            placeholder="Enter Amount"
            status={error ? 'error' : ''}
          />
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-400">Your balance after Update</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{yourBalanceAfter}</div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-400">User Balance after Update</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{userBalanceAfter}</div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CreditDrawer;

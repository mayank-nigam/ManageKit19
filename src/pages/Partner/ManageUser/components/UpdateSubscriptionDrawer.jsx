import React, { useState, useEffect } from 'react';
import { Drawer, Radio, InputNumber, DatePicker, Input, Button } from 'antd';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { formatDateToDDMmmYYYY } from '../utils/formatDate';

const { TextArea } = Input;

const MODE_SEATS = 'seats';
const MODE_TENURE = 'tenure';

const UpdateSubscriptionDrawer = ({ open, user, onClose, onSave }) => {
  const [mode, setMode] = useState(MODE_TENURE);
  const [seats, setSeats] = useState(1);
  const [months, setMonths] = useState(0);
  const [pendingTill, setPendingTill] = useState(null);
  const [billingCycle, setBillingCycle] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && user) {
      setMode(MODE_TENURE);
      setSeats(1);
      setMonths(0);
      setPendingTill(dayjs(user.subscription.endDate));
      setBillingCycle(null);
      setRemarks('');
      setErrors({});
    }
  }, [open, user]);

  useEffect(() => {
    if (mode === MODE_TENURE && user) {
      setPendingTill(dayjs(user.subscription.endDate).add(months || 0, 'month'));
    }
  }, [months, mode, user]);

  if (!user) return null;

  // Mocked "your balance" figures used purely to illustrate the license-preview section.
  const yourMonthlyBalance = 43;
  const licenseRequired = mode === MODE_SEATS ? seats : 0;

  const handleSave = async () => {
    const nextErrors = {};
    if (mode === MODE_SEATS && (!seats || seats <= 0)) nextErrors.seats = 'Enter a valid number of seats';
    if (mode === MODE_TENURE && (!months || months <= 0)) nextErrors.months = 'Enter a valid number of months';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const res = await onSave(user.id, {
      mode,
      seats,
      months,
      pendingTillDate: pendingTill ? pendingTill.format('YYYY-MM-DD') : user.subscription.endDate,
      billingCycle,
      remarks,
    });
    setSaving(false);

    if (res?.Status === 1) {
      onClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to update subscription.', 'error');
    }
  };

  return (
    <Drawer
      title="Manage Subscription"
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
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Current Subscription</h4>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>User: {user.allowUserCount > 0 ? user.allowUserCount : user.totalActiveUser}</span>
              <span>Subscription Ending On: {formatDateToDDMmmYYYY(user.subscription.endDate)}</span>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Update Subscription</h4>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} className="flex flex-col gap-3">
            <Radio value={MODE_SEATS}>Add Users</Radio>
            {mode === MODE_SEATS && (
              <div className="ml-6 -mt-1">
                <label className="block text-xs text-gray-500 mb-1">Additional Seats</label>
                <InputNumber min={1} value={seats} onChange={setSeats} style={{ width: '100%' }} status={errors.seats ? 'error' : ''} />
                {errors.seats && <div className="text-xs text-red-500 mt-1">{errors.seats}</div>}
              </div>
            )}

            <Radio value={MODE_TENURE}>Update Subscription Tenure</Radio>
            {mode === MODE_TENURE && (
              <div className="ml-6 -mt-1 space-y-2">
                <label className="block text-xs text-gray-500">Add Months</label>
                <div className="flex items-center gap-2">
                  <InputNumber min={0} value={months} onChange={setMonths} style={{ width: 90 }} status={errors.months ? 'error' : ''} />
                  <span className="text-sm text-gray-400">Pending Till</span>
                  <DatePicker value={pendingTill} onChange={setPendingTill} style={{ flex: 1 }} />
                </div>
                {errors.months && <div className="text-xs text-red-500 mt-1">{errors.months}</div>}
              </div>
            )}
          </Radio.Group>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Select License</h4>
          <Radio.Group value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
            <Radio value="monthly">Monthly</Radio>
            <Radio value="annual">Annual</Radio>
          </Radio.Group>

          {billingCycle && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                <div className="text-xs text-gray-400">Your Current {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Balance</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{yourMonthlyBalance}</div>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                <div className="text-xs text-gray-400">License required for subscription</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{licenseRequired}</div>
              </div>
            </div>
          )}
        </section>

        <section>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Remarks</label>
          <TextArea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional remarks..." />
        </section>
      </div>
    </Drawer>
  );
};

export default UpdateSubscriptionDrawer;

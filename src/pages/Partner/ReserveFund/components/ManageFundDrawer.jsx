import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Form, Input, InputNumber, Select, Switch, Button, Divider } from 'antd';
import { Lock, Unlock, Wallet, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const ManageFundDrawer = ({ open, mode, fund, onClose, onSuccess, searchUserId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [amount, setAmount] = useState(0);
  const [isLock, setIsLock] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);

  const fetchServiceOptions = useCallback(async () => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.RESERVE_FUND.GET_CREDIT_NAME_LIST}`, {
        UserId: String(userId || ''),
      });

      const details = res.data?.Details || [];
      setServiceOptions(
        details.map((item) => ({
          label: item.CreditName,
          value: item.CreditName,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch service options:', err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchServiceOptions();
      if (fund) {
        setCurrentAmount(fund.Amount || 0);
        setSelectedService(fund.ServiceName || null);
        setIsLock(fund.IsLock || false);
        setAmount(0);
        form.setFieldsValue({
          serviceName: fund.ServiceName || null,
          amount: 0,
          isLock: fund.IsLock || false,
        });
      }
    }
  }, [open, fund, fetchServiceOptions, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitAmount = parseFloat(values.amount);

      if (isNaN(submitAmount) || submitAmount === 0) {
        Swal.fire('Validation Error', 'Please enter a valid amount', 'warning');
        return;
      }

      setLoading(true);
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.RESERVE_FUND.INSERT_UPDATE}`, {
        Token: token || TokenId,
        UserId: String(userId || ''),
        CreditTypeId: fund?.CreditTypeId || 0,
        ServiceName: values.serviceName,
        Amount: submitAmount,
        IsLock: values.isLock || false,
        ResearveForUserId: searchUserId || String(userId || ''),
      });

      const result = res.data;
      if (result?.Details?.Status === '1') {
        Swal.fire('Success', result.Details.Details || 'Fund updated successfully', 'success');
        onSuccess();
      } else {
        Swal.fire('Error', result?.Details?.Details || 'Failed to update fund', 'error');
      }
    } catch (err) {
      if (err.errorFields) return;
      console.error('Failed to save fund:', err);
      Swal.fire('Error', 'Failed to update fund. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const amountAfterUpdate = currentAmount + (amount || 0);

  const drawerTitle = mode === 'release' ? 'Release Fund' : 'Manage Reserve Fund';

  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      className="reserve-fund-drawer"
      footer={
        <div className="drawer-footer">
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{ background: '#2a9629', borderColor: '#2a9629' }}
          >
            Save
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="fund-form">
        <div className="fund-info-card">
          <div className="fund-info-label">Current Balance</div>
          <div className="fund-info-value">{currentAmount}</div>
        </div>

        <Form.Item
          label="Service Name"
          name="serviceName"
          rules={[{ required: true, message: 'Please select a service name' }]}
        >
          <Select
            placeholder="Select Service Name"
            options={serviceOptions}
            disabled={!!fund?.ServiceName}
          />
        </Form.Item>

        <Form.Item
          label={mode === 'release' ? 'Release Amount' : 'Amount'}
          name="amount"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <InputNumber
            placeholder="Enter Amount"
            style={{ width: '100%' }}
            min={mode === 'release' ? -currentAmount : undefined}
            step={0.01}
            onChange={(val) => setAmount(val || 0)}
          />
        </Form.Item>

        <div className="amount-hint">
          <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {mode === 'release'
            ? 'Enter negative value to release fund, or positive value to reserve more.'
            : 'For Reserve Fund enter positive value and for Release Fund enter negative value.'}
        </div>

        {mode !== 'release' && (
          <Form.Item
            label="Lock Amount"
            name="isLock"
            valuePropName="checked"
            style={{ marginTop: 16 }}
          >
            <Switch
              checkedChildren={<Lock size={12} />}
              unCheckedChildren={<Unlock size={12} />}
            />
          </Form.Item>
        )}

        <Divider />

        <div className="fund-info-card">
          <div className="fund-info-label">Amount After Update</div>
          <div className={`fund-info-value ${amountAfterUpdate >= 0 ? 'updated' : ''}`}>
            {amountAfterUpdate}
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default ManageFundDrawer;

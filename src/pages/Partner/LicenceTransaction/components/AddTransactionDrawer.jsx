import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Button, Input, DatePicker, Radio, Form, Spin } from 'antd';
import { Send, Search } from 'lucide-react';
import dayjs from 'dayjs';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const UserAutocomplete = ({ label, value, onChange, placeholder }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(value || '');
  const timerRef = useRef(null);

  useEffect(() => {
    setSearchText(value || '');
  }, [value]);

  const handleSearch = (val) => {
    setSearchText(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val || val.length < 2) {
      setOptions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { token, userId, TokenId } = getSession();
        const res = await axios.post(`${API_BASE}${API_ENDPOINTS.LICENCE_TRANSACTION.GET_USERS_LIST}`, {
          Token: token || TokenId,
          LoggedUserId: String(userId || ''),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: { searchTerm: val },
        });

        const details = res.data?.Details;
        const users = Array.isArray(details) ? details : [];
        setOptions(users.map((u) => ({
          value: u.UserName?.trim() || '',
          userId: u.UserId,
          label: u.UserName?.trim() || '',
        })));
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (selectedValue) => {
    const selected = options.find((opt) => opt.value === selectedValue);
    setSearchText(selectedValue);
    onChange(selectedValue, selected?.userId || null);
  };

  return (
    <div className="autocomplete-field">
      <label className="field-label">{label}</label>
      <div className="autocomplete-wrapper">
        <Input
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          suffix={loading ? <Spin size="small" /> : <Search size={14} className="search-icon" />}
          className="autocomplete-input"
        />
        {options.length > 0 && searchText && (
          <div className="autocomplete-dropdown">
            {options.map((opt) => (
              <div
                key={opt.userId}
                className={`autocomplete-option ${opt.value === searchText ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AddTransactionDrawer = ({ open, onClose, onSave, licenceType }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [fromUser, setFromUser] = useState({ name: '', id: null });
  const [toUser, setToUser] = useState({ name: '', id: null });

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        licenceType: licenceType || 'Monthly',
        date: dayjs(),
      });
      setFromUser({ name: '', id: null });
      setToUser({ name: '', id: null });
    }
  }, [open, form, licenceType]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const { userId } = getSession();
      const payload = {
        UserID: String(userId || ''),
        CreatedDate: values.date?.format('DD-MMM-YYYY HH:mm') || '',
        FromUser_ID: fromUser.id,
        ToUser_ID: toUser.id,
        Debits: parseInt(values.licenceCount, 10) || 0,
        Balance: parseInt(values.balance, 10) || 0,
        Monthly: values.licenceType === 'Monthly' ? 1 : 0,
        Annual: values.licenceType === 'Annual' ? 1 : 0,
      };

      const result = await onSave(payload);
      if (result?.Status === 1) {
        form.resetFields();
        setFromUser({ name: '', id: null });
        setToUser({ name: '', id: null });
      }
    } catch (err) {
      console.error('Validation failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title="Add Licence Transaction"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      className="add-transaction-drawer"
      footer={
        <div className="drawer-footer">
          <Button onClick={onClose} className="cancel-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<Send size={14} />}
            loading={saving}
            onClick={handleSubmit}
            className="submit-btn"
          >
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="transaction-form">
        <Form.Item
          name="licenceType"
          label="Licence Type"
          rules={[{ required: true, message: 'Please select licence type' }]}
        >
          <Radio.Group className="licence-type-radio">
            <Radio.Button value="Monthly">Monthly</Radio.Button>
            <Radio.Button value="Annual">Annual</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="date"
          label="Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD-MMM-YYYY HH:mm"
            style={{ width: '100%' }}
            className="form-datepicker"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <div className="form-row">
          <Form.Item
            name="fromUser"
            label="From User"
            className="form-col"
          >
            <UserAutocomplete
              label=""
              value={fromUser.name}
              onChange={(name, id) => setFromUser({ name, id })}
              placeholder="Search from user..."
            />
          </Form.Item>

          <Form.Item
            name="toUser"
            label="To User"
            className="form-col"
          >
            <UserAutocomplete
              label=""
              value={toUser.name}
              onChange={(name, id) => setToUser({ name, id })}
              placeholder="Search to user..."
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            name="licenceCount"
            label="Licence Count"
            className="form-col"
            rules={[{ required: true, message: 'Please enter licence count' }]}
          >
            <Input
              type="number"
              min={0}
              placeholder="Enter count"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="balance"
            label="Balance"
            className="form-col"
            rules={[{ required: true, message: 'Please enter balance' }]}
          >
            <Input
              type="number"
              min={0}
              placeholder="Enter balance"
              className="form-input"
            />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddTransactionDrawer;

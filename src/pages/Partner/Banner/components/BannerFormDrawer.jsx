import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Switch, Button, Select, InputNumber, Spin, message } from 'antd';
import axios from 'axios';
import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const { TextArea } = Input;
const { Option } = Select;

const BannerFormDrawer = ({ open, banner, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [segments, setSegments] = useState([]);
  const [bgColor, setBgColor] = useState('#2a9629');
  const [isAlwaysShow, setIsAlwaysShow] = useState(true);
  const isClone = banner?.isClone === true;

  const backgroundColor = Form.useWatch('BackgroundColor', form);

  useEffect(() => {
    if (open) {
      fetchSegments();
      const color = banner?.BackgroundColor || '#2a9629';
      setBgColor(color);
      setIsAlwaysShow(
        banner?.IsAlwaysShow === 1 || banner?.IsAlwaysShow === true || !banner
      );

      if (banner && !isClone) {
        form.setFieldsValue({
          BannerName: banner.BannerName || '',
          Content: banner.BannerText || '',
          BackgroundColor: color,
          IsDismissable: banner.IsDismissable === 1,
          IsAlwaysShow: banner.IsAlwaysShow === 1 || banner.IsAlwaysShow === true,
          SegmentIds: banner.SegmentIds
            ? (typeof banner.SegmentIds === 'string' ? banner.SegmentIds.split(',').map(Number) : banner.SegmentIds)
            : [],
          DisappearTimer: banner.DisappearTimer || 0,
          TimerUnit: banner.TimerUnit || 'D',
          DisplayTimer: banner.DisplayTimer === 1 || banner.DisplayTimer === true,
        });
      } else if (isClone) {
        form.setFieldsValue({
          BannerName: `${banner.BannerName || 'Banner'} (Clone)`,
          Content: banner.BannerText || '',
          BackgroundColor: color,
          IsDismissable: banner.IsDismissable === 1,
          IsAlwaysShow: banner.IsAlwaysShow === 1 || banner.IsAlwaysShow === true,
          SegmentIds: banner.SegmentIds
            ? (typeof banner.SegmentIds === 'string' ? banner.SegmentIds.split(',').map(Number) : banner.SegmentIds)
            : [],
          DisappearTimer: banner.DisappearTimer || 0,
          TimerUnit: banner.TimerUnit || 'D',
          DisplayTimer: banner.DisplayTimer === 1 || banner.DisplayTimer === true,
        });
      } else {
        form.setFieldsValue({
          BannerName: '',
          Content: '',
          BackgroundColor: '#2a9629',
          IsDismissable: true,
          IsAlwaysShow: true,
          SegmentIds: [],
          DisappearTimer: 0,
          TimerUnit: 'D',
          DisplayTimer: false,
        });
      }
    }
  }, [open, banner, isClone]);

  useEffect(() => {
    if (backgroundColor) {
      setBgColor(backgroundColor);
    }
  }, [backgroundColor]);

  const buildPayload = (extraDetails = {}) => {
    const { token, TokenId, userId } = getSession();
    return {
      Token: token || TokenId,
      LoggedUserId: String(userId || ''),
      Details: JSON.stringify({ UserId: String(userId || ''), ...extraDetails }),
    };
  };

  const fetchSegments = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.GET_USER_SEGMENTS}`,
        buildPayload({})
      );
      if (res.data?.Status === 1 || res.data?.Status === true) {
        const list = Array.isArray(res.data?.Details)
          ? res.data.Details
          : res.data?.Details
          ? [res.data.Details]
          : [];
        setSegments(list);
      }
    } catch (err) {
      console.error('Failed to fetch segments', err);
    }
  };

  const handleColorChange = (e) => {
    const val = e.target.value;
    setBgColor(val);
    form.setFieldsValue({ BackgroundColor: val });
  };

  const handleColorTextInput = (e) => {
    const val = e.target.value;
    setBgColor(val);
    form.setFieldsValue({ BackgroundColor: val });
  };

  const handleBehaviourChange = (val) => {
    setIsAlwaysShow(val);
    form.setFieldsValue({ IsAlwaysShow: val });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const jsonSetting = JSON.stringify({
        Id: isClone ? 0 : (banner?.Id || banner?.BannerId || 0),
        BannerName: values.BannerName,
        Content: values.BannerText || '',
        BannerType: '',
        BannerBg: values.BackgroundColor || '#2a9629',
        DismissOption: values.IsDismissable || false,
        IsActive: true,
        BannerBehaviour: values.IsAlwaysShow ? 'showalltime' : 'disappearafter',
        Disappearafter: values.DisappearTimer || '',
        DisappearafterUnit: values.TimerUnit || '',
        DisplayTimer: values.DisplayTimer || false,
        UserSegments: (values.SegmentIds || []).join(','),
      });

      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.BANNER.SAVE}`,
        buildPayload({ JsonSetting: jsonSetting })
      );
      if (res.data?.Status === 1 || res.data?.Status === true) {
        message.success(isClone ? 'Banner cloned successfully' : 'Banner saved successfully');
        onSuccess();
      } else {
        message.error(res.data?.Message || 'Failed to save banner');
      }
    } catch (err) {
      console.error('Failed to save banner', err);
      if (err.errorFields) return;
      message.error('Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const title = banner && !isClone ? 'Edit Banner' : isClone ? 'Clone Banner' : 'Add Banner';

  const segmentOptions = [
    <Option key="all" value={0}>All</Option>,
    ...segments.map((seg) => (
      <Option key={seg.Id} value={seg.Id}>
        {seg.SegmentName}
      </Option>
    ))
  ];

  return (
    <Drawer
      title={title}
      placement="right"
      width={520}
      onClose={onClose}
      open={open}
      className="banner-drawer"
      footer={
        <div className="drawer-footer">
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            {isClone ? 'Clone' : 'Save'}
          </Button>
        </div>
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          className="banner-form"
          initialValues={{
            BackgroundColor: '#2a9629',
            IsDismissable: true,
            IsAlwaysShow: true,
            SegmentIds: [],
            DisappearTimer: 0,
            TimerUnit: 'D',
            DisplayTimer: false,
          }}
        >
          <Form.Item
            label="Banner Name"
            name="BannerName"
            rules={[{ required: true, message: 'Please enter banner name' }]}
          >
            <Input placeholder="Enter banner name" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Banner Text"
            name="BannerText"
            rules={[{ required: true, message: 'Please enter banner text' }]}
          >
            <TextArea
              placeholder="Enter banner text"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Background Color"
            name="BackgroundColor"
          >
            <div className="color-picker-wrapper">
              <input
                type="color"
                className="color-preview"
                value={bgColor}
                onChange={handleColorChange}
              />
              <Input
                className="color-input"
                value={bgColor}
                onChange={handleColorTextInput}
                placeholder="#2a9629"
                maxLength={7}
              />
            </div>
          </Form.Item>

          <Form.Item
            label="User Segment"
            name="SegmentIds"
          >
            <Select
              mode="multiple"
              placeholder={segments.length > 0 ? 'Select user segments' : 'All'}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {segmentOptions}
            </Select>
          </Form.Item>

          <Form.Item
            label="Dismiss Option"
            name="IsDismissable"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>

          <Form.Item
            label="Banner Behaviour"
            name="IsAlwaysShow"
            valuePropName="checked"
          >
            <div className="behaviour-radio">
              <label className="behaviour-option">
                <input
                  type="radio"
                  name="behaviour"
                  checked={isAlwaysShow === true}
                  onChange={() => handleBehaviourChange(true)}
                />
                Show's all the time
              </label>
              <label className="behaviour-option">
                <input
                  type="radio"
                  name="behaviour"
                  checked={isAlwaysShow === false}
                  onChange={() => handleBehaviourChange(false)}
                />
                Disappear's after
              </label>
              {!isAlwaysShow && (
                <div className="timer-row">
                  <Form.Item name="DisappearTimer" noStyle>
                    <InputNumber
                      className="timer-input"
                      min={1}
                      placeholder="Time"
                    />
                  </Form.Item>
                  <Form.Item name="TimerUnit" noStyle>
                    <Select className="timer-unit">
                      <Option value="H">Hours</Option>
                      <Option value="D">Days</Option>
                    </Select>
                  </Form.Item>
                  <label className="timer-checkbox">
                    <Form.Item name="DisplayTimer" valuePropName="checked" noStyle>
                      <input type="checkbox" />
                    </Form.Item>
                    Display Timer
                  </label>
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default BannerFormDrawer;

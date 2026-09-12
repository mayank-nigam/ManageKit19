import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Select, Switch, Collapse, Spin, message } from 'antd';
import { Search, ChevronDown, ChevronRight, Info } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');

const SMSTab = () => {
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [senderOptions, setSenderOptions] = useState([]);
  const [templateOptions, setTemplateOptions] = useState({});

  const buildPayload = (extraDetails = {}) => {
    const { TokenId, userId } = getSession();
    return {
      Token: TokenId,
      LoggedUserId: String(userId || ''),
      Message: '',
      MAC_Address: '',
      IP_Address: '',
      Details: { UserId: String(userId || ''), ...extraDetails },
    };
  };

  const fetchSenderNames = useCallback(async () => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_SMS_SENDER_ID}`, buildPayload({ AccountId: String(userId), UserId: String(userId) }));
      if (Array.isArray(res.data?.Details)) {
        setSenderOptions(res.data.Details.map(s => ({ code: s.Code, text: s.Text })));
      }
    } catch (err) {
      console.error('Failed to fetch sender names:', err);
    }
  }, []);

  const fetchTemplates = useCallback(async (senderName) => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_SMS_TEMPLATE}`, buildPayload({ SenderName: senderName, UserId: String(userId) }));
      if (Array.isArray(res.data?.Details)) {
        return res.data.Details.map(t => ({ code: t.Code, text: t.Text }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      return [];
    }
  }, []);

  const fetchSmsNotifications = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_SMS_BY_CATEGORY}`, buildPayload({ SearchText: search, UserId: String(userId) }));
      const data = res.data?.Details;
      if (data && typeof data === 'object') {
        const grouped = {};
        Object.keys(data).forEach((key) => {
          const items = data[key];
          if (Array.isArray(items)) {
            items.forEach((item) => {
              const cat = item.Category || 'Uncategorized';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(item);
            });
          }
        });
        setGroupedData(grouped);
      }
    } catch (err) {
      console.error('Failed to fetch SMS notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSmsNotifications();
    fetchSenderNames();
  }, [fetchSmsNotifications, fetchSenderNames]);

  const handleSearch = () => {
    fetchSmsNotifications(searchText);
  };

  const handleStatusChange = async (item, senderText, isActive) => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.CHANGE_DLT_STATUS}`, buildPayload({
        UserId: String(userId),
        Event: item.EventName,
        DLTTemplateID: item.DltId || '',
        eventid: item.EventId,
        isactive: isActive ? 1 : 0,
        smscontent: item.MessageTextWithVariables || '',
        senderid: senderText,
      }));
      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      if (parsed[0]?.ResultMessage) {
        message.success(parsed[0].ResultMessage);
        fetchSmsNotifications(searchText);
      }
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const handleSenderChange = async (itemId, senderCode, senderText) => {
    const templates = await fetchTemplates(senderText);
    setTemplateOptions(prev => ({ ...prev, [itemId]: templates }));
  };

  const collapseItems = Object.keys(groupedData).map((category, index) => {
    const items = groupedData[category];
    const activeCount = items.filter(i => i.status === 1).length;
    return {
      key: index.toString(),
      label: (
        <div className="accordion-header">
          <span className="accordion-title">{category}</span>
          <span className={`accordion-badge ${activeCount === items.length ? 'all-active' : ''}`}>
            <span className="badge-active">{activeCount}</span> / <span className="badge-total">{items.length}</span>
          </span>
        </div>
      ),
      children: (
        <div className="sms-table-wrapper">
          <table className="sms-table">
            <thead>
              <tr>
                <th className="col-type">Type</th>
                <th className="col-text">Text</th>
                <th className="col-sender">Sender ID</th>
                <th className="col-template">Template</th>
                <th className="col-dlt">DLT ID</th>
                <th className="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="col-type">{item.EventName || ''}</td>
                  <td className="col-text">
                    <div className="text-cell">
                      <span className="text-content" title={item.MessageText || ''}>{item.MessageText || ''}</span>
                      <Tooltip title={item.MessageTextWithVariables || ''}>
                        <Info size={14} className="info-icon-sm" />
                      </Tooltip>
                    </div>
                  </td>
                  <td className="col-sender">
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      placeholder="Select Sender"
                      onChange={(val, option) => handleSenderChange(item.Id, val, option.children)}
                      defaultValue={item.senderid || undefined}
                    >
                      {senderOptions.map((s, i) => (
                        <Select.Option key={i} value={s.code}>{s.text}</Select.Option>
                      ))}
                    </Select>
                  </td>
                  <td className="col-template">
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      placeholder="Select Template"
                      defaultValue={item.dltid || undefined}
                      options={(templateOptions[item.Id] || []).map(t => ({ value: t.code, label: t.text }))}
                    />
                  </td>
                  <td className="col-dlt">
                    <Input size="small" value={item.DltId || ''} disabled />
                  </td>
                  <td className="col-status">
                    <Switch
                      size="small"
                      checked={item.status === 1}
                      onChange={(checked) => handleStatusChange(item, senderOptions.find(s => s.code === item.senderid)?.text || '', checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    };
  });

  return (
    <div className="tab-content sms-tab">
      <div className="sms-notice">
        <p>Indian telecom regulatory mandates DLT registration and Template approval to send SMS to Indian mobile numbers. If you would like to send SMS at various events to your users, you must configure DLT for the required SMS alerts below.</p>
        <p>Also, you must get the messages approved exactly as prescribed below, with the part of the message in curly braces (For example: {'{user.user_login}'}) as the dynamic part in order to replace it with the relevant content.</p>
      </div>

      <div className="sms-search-row">
        <Input
          prefix={<Search size={14} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by title..."
          onPressEnter={handleSearch}
          style={{ maxWidth: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>Search</Button>
      </div>

      {loading ? (
        <div className="loading-state"><Spin size="large" /></div>
      ) : (
        <Collapse
          items={collapseItems}
          defaultActiveKey={collapseItems.length > 0 ? ['0'] : []}
          accordion
          className="sms-accordion"
        />
      )}
    </div>
  );
};

const Tooltip = ({ title, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="custom-tooltip" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="tooltip-content">{title}</span>}
    </span>
  );
};

export default SMSTab;

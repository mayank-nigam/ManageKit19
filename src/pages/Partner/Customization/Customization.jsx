import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, Button, Spin, message } from 'antd';
import { Globe, Mail, MessageSquare, Smartphone, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

import WebPortalTab from './tabs/WebPortalTab';
import EmailTab from './tabs/EmailTab';
import SMSTab from './tabs/SMSTab';
import MobileAppTab from './tabs/MobileAppTab';

import '../shared/PartnerCommon.css';
import './Customization.css';

const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');
const DOCS_URL = 'https://docs.kit19.com';

const Customization = () => {
  const [activeTab, setActiveTab] = useState('webportal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resellerId, setResellerId] = useState(null);

  const [webData, setWebData] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [mobileData, setMobileData] = useState(null);

  const buildPayload = useCallback((extraDetails = {}) => {
    const { TokenId, userId } = getSession();
    return {
      Token: TokenId,
      LoggedUserId: String(userId || ''),
      Message: '',
      MAC_Address: '',
      IP_Address: '',
      Details: {
        USERID: String(userId || ''),
        ...extraDetails,
      },
    };
  }, []);

  const fetchResellerId = useCallback(async () => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_RESELLER_ID}`, buildPayload({ userid: String(userId) }));
      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      if (Array.isArray(parsed) && parsed[0]?.Reseller_Id) {
        setResellerId(parsed[0].Reseller_Id);
      }
    } catch (err) {
      console.error('Failed to fetch reseller ID:', err);
    }
  }, [buildPayload]);

  const fetchWebDetails = useCallback(async () => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.LOAD_DETAILS}`, buildPayload({ USERID: String(userId), Mode: 'web' }));
      const data = res.data?.Details?.data || res.data?.Details;
      if (Array.isArray(data) && data.length > 0) {
        setWebData(data[0]);
      } else {
        setWebData(null);
      }
    } catch (err) {
      console.error('Failed to fetch web details:', err);
      setWebData(null);
    }
  }, [buildPayload]);

  const fetchEmailDetails = useCallback(async () => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.LOAD_DETAILS}`, buildPayload({ USERID: String(userId), Mode: 'email' }));
      const data = res.data?.Details?.data || res.data?.Details;
      if (Array.isArray(data) && data.length > 0) {
        setEmailData(data);
      } else {
        setEmailData(null);
      }
    } catch (err) {
      console.error('Failed to fetch email details:', err);
      setEmailData(null);
    }
  }, [buildPayload]);

  const fetchMobileDetails = useCallback(async () => {
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.LOAD_DETAILS}`, buildPayload({ USERID: String(userId), Mode: 'mobile' }));
      const data = res.data?.Details?.data || res.data?.Details;
      if (Array.isArray(data) && data.length > 0) {
        setMobileData(data[0]);
      } else {
        setMobileData(null);
      }
    } catch (err) {
      console.error('Failed to fetch mobile details:', err);
      setMobileData(null);
    }
  }, [buildPayload]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await fetchResellerId();
    await Promise.allSettled([fetchWebDetails(), fetchEmailDetails(), fetchMobileDetails()]);
    setLoading(false);
  }, [fetchResellerId, fetchWebDetails, fetchEmailDetails, fetchMobileDetails]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'webportal') fetchWebDetails();
    else if (key === 'email') fetchEmailDetails();
    else if (key === 'sms') { /* SMS loads its own data */ }
    else if (key === 'mobileapp') fetchMobileDetails();
  };

  const handleSaveWebPortal = async (params) => {
    setSaving(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.SAVE_WEB_PORTAL}`, buildPayload({ ...params, USERID: String(userId) }));
      if (Array.isArray(res.data?.Details) && res.data.Details.length > 0 && res.data.Details[0].Message) {
        message.success(res.data.Details[0].Message);
        fetchWebDetails();
        return { Status: 1 };
      } else if (res.data?.Details === 'Success') {
        message.success('Web portal details saved successfully');
        fetchWebDetails();
        return { Status: 1 };
      } else {
        message.error(res.data?.Details || 'Failed to save');
        return { Status: 0 };
      }
    } catch (err) {
      message.error('Failed to save web portal details');
      return { Status: 0 };
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async (params) => {
    setSaving(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.SAVE_EMAIL}`, buildPayload({ ...params, USERID: String(userId) }));
      if (Array.isArray(res.data?.Details) && res.data.Details.length > 0 && res.data.Details[0].Message) {
        message.success(res.data.Details[0].Message);
        fetchEmailDetails();
        return { Status: 1 };
      } else if (res.data?.Details === 'Success') {
        message.success('Email details saved successfully');
        fetchEmailDetails();
        return { Status: 1 };
      } else {
        message.error(res.data?.Details || 'Failed to save');
        return { Status: 0 };
      }
    } catch (err) {
      message.error('Failed to save email details');
      return { Status: 0 };
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMobile = async (params) => {
    setSaving(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.SAVE_MOBILE}`, buildPayload({ ...params, USERID: String(userId) }));
      if (Array.isArray(res.data?.Details) && res.data.Details.length > 0 && res.data.Details[0].Message) {
        message.success(res.data.Details[0].Message);
        fetchMobileDetails();
        return { Status: 1 };
      } else if (res.data?.Details === 'Success') {
        message.success('Mobile app details saved successfully');
        fetchMobileDetails();
        return { Status: 1 };
      } else {
        message.error(res.data?.Details || 'Failed to save');
        return { Status: 0 };
      }
    } catch (err) {
      message.error('Failed to save mobile app details');
      return { Status: 0 };
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = async (file) => {
    const { userId } = getSession();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'uploadfile');
    formData.append('userId', String(userId));
    formData.append('reseller_id', resellerId || '');
    try {
      const res = await axios.post(API_ENDPOINTS.CUSTOMIZATION.FILE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, fileName: file.name };
    } catch (err) {
      message.error('File upload failed');
      return { success: false };
    }
  };

  const tabItems = [
    {
      key: 'webportal',
      label: (
        <span className="tab-label">
          <Globe size={15} />
          Web Portal
        </span>
      ),
      children: (
        <WebPortalTab
          data={webData}
          onSave={handleSaveWebPortal}
          onUploadFile={handleUploadFile}
          saving={saving}
          resellerId={resellerId}
        />
      ),
    },
    {
      key: 'email',
      label: (
        <span className="tab-label">
          <Mail size={15} />
          Email
        </span>
      ),
      children: (
        <EmailTab
          data={emailData}
          onSave={handleSaveEmail}
          saving={saving}
        />
      ),
    },
    {
      key: 'sms',
      label: (
        <span className="tab-label">
          <MessageSquare size={15} />
          SMS
        </span>
      ),
      children: <SMSTab />,
    },
    {
      key: 'mobileapp',
      label: (
        <span className="tab-label">
          <Smartphone size={15} />
          Mobile APP
        </span>
      ),
      children: (
        <MobileAppTab
          data={mobileData}
          onSave={handleSaveMobile}
          onUploadFile={handleUploadFile}
          saving={saving}
          resellerId={resellerId}
        />
      ),
    },
  ];

  return (
    <div className="customization-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Customization</h1>
          <p className="page-subtitle">Manage portal settings, branding, and appearance.</p>
        </div>
        <div className="page-header-actions">
          <Button icon={<RefreshCw size={15} />} onClick={fetchAllData} className="refresh-btn" disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="customization-card">
        {loading ? (
          <div className="loading-state">
            <Spin size="large" />
            <p>Loading customization data...</p>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="customization-tabs"
          />
        )}
      </div>
    </div>
  );
};

export default Customization;

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Row, Col, Select, Checkbox, Switch, Tooltip, message } from 'antd';
import { Save, Info } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');
const { TextArea } = Input;

const EmailTab = ({ data, onSave, saving }) => {
  const { userId, TokenId } = getSession();
  const isAdmin = userId === 335;

  const [fromEmailList, setFromEmailList] = useState([]);
  const [fromEmail, setFromEmail] = useState('');
  const [personalisation, setPersonalisation] = useState(false);
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [signatureDetails, setSignatureDetails] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [address, setAddress] = useState('');
  const [address1, setAddress1] = useState('');
  const [mobile1, setMobile1] = useState('');
  const [mobile2, setMobile2] = useState('');
  const [description, setDescription] = useState('');
  const [fbUrl, setFbUrl] = useState('');
  const [twtUrl, setTwtUrl] = useState('');
  const [lnkUrl, setLnkUrl] = useState('');
  const [whtUrl, setWhtUrl] = useState('');

  const [fbProtocol, setFbProtocol] = useState('https://');
  const [twtProtocol, setTwtProtocol] = useState('https://');
  const [lnkProtocol, setLnkProtocol] = useState('https://');
  const [whtProtocol, setWhtProtocol] = useState('https://');

  const [mobile1Error, setMobile1Error] = useState('');
  const [mobile2Error, setMobile2Error] = useState('');
  const [fbError, setFbError] = useState('');
  const [twtError, setTwtError] = useState('');
  const [lnkError, setLnkError] = useState('');
  const [whtError, setWhtError] = useState('');

  const URL_PATTERN = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(:[0-9]{1,5})?(\/[^\s]*)?$/;

  const fetchFromMailIds = useCallback(async () => {
    try {
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_FROM_MAIL_ID}`, {
        Token: TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { ParentId: Number(userId) || 0 },
      });
      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      if (Array.isArray(parsed)) {
        setFromEmailList(parsed.map(item => ({ code: item.Code || item.Mail_ID, text: item.Text || item.Mail_ID })));
      }
    } catch (err) {
      console.error('Failed to fetch from mail IDs:', err);
      setFromEmailList([]);
    }
  }, [userId, TokenId]);

  useEffect(() => {
    fetchFromMailIds();
  }, [fetchFromMailIds]);

  useEffect(() => {
    if (data && data.length > 0) {
      const d = data[0];
      setFromEmail(d.Email || '');
      setPersonalisation(d.Personalisation === '1' || d.Personalisation === 1);
      setSignatureEnabled(d.Signature === '1' || d.Signature === 1);
      setSignatureDetails(d.SignatureDetails || '');
      setTitle(d.Title || '');
      setSubtitle(d.Subtitle || '');
      setAddress(d.Address || '');
      setAddress1(d.Address1 || '');
      setMobile1(d.Mobile1 || '');
      setMobile2(d.Mobile2 || '');
      setDescription(d.Description || '');
      setFbUrl(d.Facebok || d.Facebook || '');
      setTwtUrl(d.Twiter || d.Twitter || '');
      setLnkUrl(d.Linkd || d.LinkedIn || '');
      setWhtUrl(d.Whatsapp || '');
    }
  }, [data]);

  const validateMobile = (value) => {
    if (!value) return '';
    const parts = value.split(' ');
    const num = parts.length > 1 ? parts[1] : value;
    const code = parts.length > 1 ? parts[0] : '';
    if (code === '+91') {
      if (num.length !== 10 || isNaN(num)) return 'Mobile number must be exactly 10 digits for India (+91).';
    } else {
      if (num.length < 5 || num.length > 12) return 'Mobile number must be between 5 and 12 digits.';
      if (num.charAt(0) === '0') return 'First digit of the mobile number should not be zero.';
    }
    return '';
  };

  const handleMobile1Change = (e) => {
    const val = e.target.value;
    setMobile1(val);
    setMobile1Error(validateMobile(val));
  };

  const handleMobile2Change = (e) => {
    const val = e.target.value;
    setMobile2(val);
    setMobile2Error(validateMobile(val));
  };

  const handleSave = async () => {
    if (!fromEmail) { message.error('Enter valid EmailId'); return; }
    if (mobile1Error || mobile2Error) { message.error('Please fix mobile validation errors'); return; }

    const params = {
      Email: fromEmail,
      Title: title,
      Subtitle: subtitle,
      Description: description,
      Address: address,
      Address1: address1,
      AltNm: mobile1,
      Mobile2: mobile2,
      FbUrl: fbUrl,
      TwtUrl: twtUrl,
      LnkUrl: lnkUrl,
      Whatsapp: whtUrl,
      Personalisation: personalisation ? 1 : 0,
      Signature: signatureEnabled ? 1 : 0,
      SignatureEditor: signatureDetails,
      SignatureDetails: {
        SignatureName: '',
        SignatureCompany: '',
        AddressLine1: '',
        AddressLine2: '',
        Country: '',
        Addrs: '',
      },
    };
    onSave(params);
  };

  return (
    <div className="tab-content">
      {/* From Email */}
      <div className="form-row-custom">
        <label className="form-label">From Email</label>
        <Select
          value={fromEmail || undefined}
          onChange={setFromEmail}
          placeholder="Select Email"
          className="full-width"
          disabled={isAdmin}
          showSearch
          optionFilterProp="children"
        >
          {fromEmailList.map((item, idx) => (
            <Select.Option key={idx} value={item.code}>{item.text}</Select.Option>
          ))}
        </Select>
      </div>

      {/* Personalisation */}
      <div className="form-row-custom">
        <label className="form-label">Personalisation</label>
        <div className="checkbox-row">
          <Checkbox checked={personalisation} onChange={(e) => setPersonalisation(e.target.checked)} disabled={isAdmin}>
            Enable personalisation
          </Checkbox>
          <Tooltip title="If you check this box, the notification mail sent to your users will be personalised like 'Dear Name'">
            <Info size={16} className="info-icon" />
          </Tooltip>
        </div>
      </div>

      {/* Signature */}
      <div className="form-row-custom">
        <label className="form-label">Signature</label>
        <div className="checkbox-row">
          <Checkbox checked={signatureEnabled} onChange={(e) => setSignatureEnabled(e.target.checked)} disabled={isAdmin}>
            Enable signature
          </Checkbox>
          <Tooltip title="This signature will appear below all emails sent to your users.">
            <Info size={16} className="info-icon" />
          </Tooltip>
        </div>
        {signatureEnabled && (
          <div className="mt-2">
            <TextArea
              rows={4}
              value={signatureDetails}
              onChange={(e) => setSignatureDetails(e.target.value)}
              placeholder="Enter Signature details"
              disabled={isAdmin}
            />
          </div>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Title" disabled={isAdmin} />
        </div>
        <div className="half">
          <label className="form-label">SubTitle</label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Enter SubTitle" disabled={isAdmin} />
        </div>
      </div>

      {/* Addresses */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">Address</label>
          <TextArea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter Address" disabled={isAdmin} />
        </div>
        <div className="half">
          <label className="form-label">Address1</label>
          <TextArea rows={3} value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Enter Address" disabled={isAdmin} />
        </div>
      </div>

      {/* Mobiles */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">Mobile 1 <span className="required">*</span></label>
          <Input value={mobile1} onChange={handleMobile1Change} placeholder="Enter Mobile No" disabled={isAdmin} />
          {mobile1Error && <small className="error-text">{mobile1Error}</small>}
        </div>
        <div className="half">
          <label className="form-label">Mobile 2 <span className="required">*</span></label>
          <Input value={mobile2} onChange={handleMobile2Change} placeholder="Enter Mobile No" disabled={isAdmin} />
          {mobile2Error && <small className="error-text">{mobile2Error}</small>}
        </div>
      </div>

      {/* Description */}
      <div className="form-row-custom">
        <label className="form-label">Description</label>
        <TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Description" disabled={isAdmin} />
      </div>

      {/* Social Media URLs */}
      <div className="form-row-custom triple">
        <div className="third">
          <label className="form-label">Facebook url <span className="required">*</span></label>
          <div className="domain-input-group">
            <select value={fbProtocol} onChange={(e) => setFbProtocol(e.target.value)} className="protocol-select" disabled={isAdmin}>
              <option value="http://">http://</option>
              <option value="https://">https://</option>
            </select>
            <Input value={fbUrl} onChange={(e) => { setFbUrl(e.target.value); setFbError(''); }} placeholder="Enter Facebook URL" disabled={isAdmin} />
          </div>
          {fbError && <small className="error-text">{fbError}</small>}
        </div>
        <div className="third">
          <label className="form-label">Twitter link <span className="required">*</span></label>
          <div className="domain-input-group">
            <select value={twtProtocol} onChange={(e) => setTwtProtocol(e.target.value)} className="protocol-select" disabled={isAdmin}>
              <option value="http://">http://</option>
              <option value="https://">https://</option>
            </select>
            <Input value={twtUrl} onChange={(e) => { setTwtUrl(e.target.value); setTwtError(''); }} placeholder="Enter twitter link" disabled={isAdmin} />
          </div>
          {twtError && <small className="error-text">{twtError}</small>}
        </div>
        <div className="third">
          <label className="form-label">Linkedin <span className="required">*</span></label>
          <div className="domain-input-group">
            <select value={lnkProtocol} onChange={(e) => setLnkProtocol(e.target.value)} className="protocol-select" disabled={isAdmin}>
              <option value="http://">http://</option>
              <option value="https://">https://</option>
            </select>
            <Input value={lnkUrl} onChange={(e) => { setLnkUrl(e.target.value); setLnkError(''); }} placeholder="Enter linkedin URL" disabled={isAdmin} />
          </div>
          {lnkError && <small className="error-text">{lnkError}</small>}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="form-row-custom">
        <label className="form-label">Whatsapp Chat <span className="required">*</span></label>
        <div className="domain-input-group" style={{ maxWidth: 600 }}>
          <select value={whtProtocol} onChange={(e) => setWhtProtocol(e.target.value)} className="protocol-select" disabled={isAdmin}>
            <option value="http://">http://</option>
            <option value="https://">https://</option>
          </select>
          <Input value={whtUrl} onChange={(e) => { setWhtUrl(e.target.value); setWhtError(''); }} placeholder="Enter WhatsApp URL" disabled={isAdmin} />
        </div>
        {whtError && <small className="error-text">{whtError}</small>}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button className="cancel-btn" disabled={isAdmin}>Cancel</Button>
        <Button type="primary" icon={<Save size={14} />} onClick={handleSave} loading={saving} disabled={isAdmin} className="save-btn">
          Save
        </Button>
      </div>
    </div>
  );
};

export default EmailTab;

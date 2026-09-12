import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Radio, Upload, message, Modal, Spin, Alert } from 'antd';
import { Save, CheckCircle, AlertCircle, Upload as UploadIcon, Expand } from 'lucide-react';
import axios from 'axios';

import { getSession } from '../../../../getSession';
import API_ENDPOINTS from '../../../../config/apiEndpoints';

const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');
const DOCS_URL = 'https://docs.kit19.com';

const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const WebPortalTab = ({ data, onSave, onUploadFile, saving, resellerId }) => {
  const { userId } = getSession();
  const isAdmin = userId === 335;

  const [protocol, setProtocol] = useState('https://');
  const [domainName, setDomainName] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [hyperlinkProtocol, setHyperlinkProtocol] = useState('https://');
  const [termProtocol, setTermProtocol] = useState('https://');
  const [termUrl, setTermUrl] = useState('');
  const [policyProtocol, setPolicyProtocol] = useState('https://');
  const [policyUrl, setPolicyUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFileName, setLogoFileName] = useState('');

  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [faviconFileName, setFaviconFileName] = useState('');

  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState('');
  const [bgFileName, setBgFileName] = useState('');

  const [domainError, setDomainError] = useState('');
  const [hyperlinkError, setHyperlinkError] = useState('');
  const [termError, setTermError] = useState('');
  const [policyError, setPolicyError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [faviconError, setFaviconError] = useState('');
  const [bgError, setBgError] = useState('');

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyDomainValue, setVerifyDomainValue] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef(null);

  const [previewImageModalVisible, setPreviewImageModalVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  useEffect(() => {
    if (data) {
      setDomainName(data.DomainName || '');
      setHyperlink(data.HyperlinkLogo || '');
      setTermUrl(data.TermUrl || '');
      setPolicyUrl(data.PolicyUrl || '');
      setSelectedTheme(data.Theme || '');

      if (data.LogoUrl) {
        setLogoPreview(`${DOCS_URL}/assets/custom/partner/resource/${resellerId}/${data.LogoUrl}`);
        setLogoFileName(data.LogoUrl);
      }
      if (data.Favicon) {
        setFaviconPreview(`${DOCS_URL}/assets/custom/partner/resource/${resellerId}/${data.Favicon}`);
        setFaviconFileName(data.Favicon);
      }
      if (data.Background_ImageUrl) {
        setBgPreview(`${DOCS_URL}/assets/custom/partner/resource/${resellerId}/${data.Background_ImageUrl}`);
        setBgFileName(data.Background_ImageUrl);
      }
    }
  }, [data, resellerId]);

  const validateUrl = (url) => {
    if (!url) return true;
    return URL_PATTERN.test(url);
  };

  const handleVerifyDomain = async () => {
    if (!domainName) {
      setDomainError('Please enter a valid domain name.');
      return;
    }
    setDomainError('');
    setVerifyLoading(true);
    try {
      const extractedDomain = domainName;
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.CHECK_DOMAIN_EXISTENCE}`, {
        Token: getSession().TokenId,
        LoggedUserId: String(userId),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { domain: extractedDomain },
      });
      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      if (Array.isArray(parsed) && parsed[0]?.ExistsInAnyTable === '1') {
        message.warning('Domain already used by another user');
      } else {
        const keyRes = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.GET_DOMAIN_KEY}`, {
          Token: getSession().TokenId,
          LoggedUserId: String(userId),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: { UserId: String(userId), domain: domainName },
        });
        const keyData = typeof keyRes.data?.Details === 'string' ? JSON.parse(keyRes.data.Details) : keyRes.data?.Details || [];
        if (Array.isArray(keyData) && keyData.length > 0) {
          setVerifyDomainValue(keyData[0].record_value || '');
          setVerifyModalVisible(true);
          setVerifyStatus(null);
          setCountdown(30);
        } else {
          message.error(keyData[0]?.message || 'Domain key not found');
        }
      }
    } catch (err) {
      message.error('Error verifying domain');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyConfirm = async () => {
    setVerifyStatus('verifying');
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setVerifyStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.VERIFY_DOMAIN}`, {
        domainName: domainName,
        kys: verifyDomainValue,
      });
      if (res.data?.d) {
        clearInterval(countdownRef.current);
        setVerifyStatus('success');
        await axios.post(`${API_BASE}${API_ENDPOINTS.CUSTOMIZATION.SAVE_DOMAIN_KEY}`, {
          Token: getSession().TokenId,
          LoggedUserId: String(userId),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: { userid: String(userId), domain: domainName, createdby: String(userId), domaintype: 'CRM' },
        });
        setTimeout(() => setVerifyModalVisible(false), 2000);
      } else {
        clearInterval(countdownRef.current);
        setVerifyStatus('failed');
      }
    } catch (err) {
      clearInterval(countdownRef.current);
      setVerifyStatus('failed');
    }
  };

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const handleFileChange = (file, type) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      const setError = type === 'logo' ? setLogoError : type === 'favicon' ? setFaviconError : setBgError;
      setError('Invalid file type. Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'logo') { setLogoPreview(e.target.result); setLogoFile(file); }
      else if (type === 'favicon') { setFaviconPreview(e.target.result); setFaviconFile(file); }
      else { setBgPreview(e.target.result); setBgFile(file); }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!domainName) { message.error('Enter Domain name'); return; }
    if (!hyperlink) { message.error('Enter Hyper link'); return; }
    if (!validateUrl(hyperlink)) { setHyperlinkError('Please enter a valid URL.'); return; }
    if (!validateUrl(termUrl)) { setTermError('Please enter a valid URL.'); return; }
    if (!validateUrl(policyUrl)) { setPolicyError('Please enter a valid URL.'); return; }

    if (logoFile) {
      const uploadResult = await onUploadFile(logoFile);
      if (!uploadResult.success) return;
    }
    if (faviconFile) {
      const uploadResult = await onUploadFile(faviconFile);
      if (!uploadResult.success) return;
    }
    if (bgFile) {
      const uploadResult = await onUploadFile(bgFile);
      if (!uploadResult.success) return;
    }

    const params = {
      DomainName: domainName,
      LogoUrl: logoFileName || '',
      HyperlinkLogo: hyperlink,
      favicon: faviconFileName || '',
      Theme: selectedTheme,
      Background_ImageUrl: bgFileName || '',
      TermUrl: termUrl,
      PolicyUrl: policyUrl,
    };
    onSave(params);
  };

  return (
    <div className="tab-content">
      {/* Information Alert */}
      <Alert
        message="Web Portal Configuration"
        description="Configure your web portal settings including domain name, logo, favicon, theme, and background image. These settings will be applied to your custom portal domain. All uploads should follow the specified file size and format requirements."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
        className="portal-info-alert"
      />

      {/* CRM Domain Name */}
      <div className="form-row-custom">
        <label className="form-label">CRM Domain Name <span className="required">*</span></label>
        <div className="domain-input-group">
          <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="protocol-select">
            <option value="http://">http://</option>
            <option value="https://">https://</option>
          </select>
          <Input
            value={domainName}
            onChange={(e) => { setDomainName(e.target.value); setDomainError(''); }}
            placeholder="Enter Domain Name"
            disabled={isAdmin}
            className="domain-input"
          />
          <Button onClick={handleVerifyDomain} loading={verifyLoading} disabled={isAdmin} className="verify-btn">
            Verify
          </Button>
        </div>
        {domainError && <small className="error-text">{domainError}</small>}
      </div>

      {/* Logo */}
      <div className="form-row-custom">
        <label className="form-label">Logo</label>
        <div className="file-upload-row">
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0], 'logo')}
              disabled={isAdmin}
              className="file-input"
              id="logoUpload"
            />
            <label htmlFor="logoUpload" className="file-label">
              <UploadIcon size={16} /> Choose a file
            </label>
            <p className="file-hint">Logo size usually between 20 KB and 150 KB. File size is (120px X 60px). Only image files are allowed.</p>
            {logoError && <small className="error-text">{logoError}</small>}
          </div>
          <div className="preview-box">
            <img src={logoPreview || '/assets/custom/img/logo.jpg'} alt="Logo Preview" className="preview-img" />
          </div>
        </div>
      </div>

      {/* Hyperlink on Logo */}
      <div className="form-row-custom">
        <label className="form-label">Hyperlink on Logo</label>
        <div className="domain-input-group">
          <select value={hyperlinkProtocol} onChange={(e) => setHyperlinkProtocol(e.target.value)} className="protocol-select">
            <option value="http://">http://</option>
            <option value="https://">https://</option>
          </select>
          <Input
            value={hyperlink}
            onChange={(e) => { setHyperlink(e.target.value); setHyperlinkError(''); }}
            placeholder="Enter Hyperlink on Logo"
            disabled={isAdmin}
          />
        </div>
        {hyperlinkError && <small className="error-text">{hyperlinkError}</small>}
      </div>

      {/* Favicon */}
      <div className="form-row-custom">
        <label className="form-label">Favicon</label>
        <div className="file-upload-row">
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0], 'favicon')}
              disabled={isAdmin}
              className="file-input"
              id="faviconUpload"
            />
            <label htmlFor="faviconUpload" className="file-label">
              <UploadIcon size={16} /> Choose a file
            </label>
            <p className="file-hint">favicons size usually between 16 KB and 32 KB. file size is (16px X 16px).</p>
            {faviconError && <small className="error-text">{faviconError}</small>}
          </div>
          <div className="preview-box small">
            <img src={faviconPreview || '/assets/custom/img/logo.jpg'} alt="Favicon Preview" className="preview-img" />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="form-row-custom">
        <label className="form-label">Theme</label>
        <div className="theme-options">
          {[1, 2, 3].map((num) => (
            <div key={num} className="theme-option">
              <label className="radio-cont">
                <Radio
                  checked={selectedTheme === `Theme ${num}`}
                  onChange={() => setSelectedTheme(`Theme ${num}`)}
                  disabled={isAdmin}
                >
                  Theme {num}
                </Radio>
                <span className="checkmark"></span>
              </label>
              <div
                className="theme-thumbnail thumbnaildiv"
                onClick={() => {
                  setPreviewImageUrl(`/assets/custom/img/loginsample${num}.png`);
                  setPreviewImageModalVisible(true);
                }}
                role="button"
                tabIndex="0"
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`/assets/custom/img/loginsample${num}.png`}
                  alt={`Theme ${num} Preview`}
                  className="example-image theme-preview-img"
                  onError={(e) => {
                    if (!e.target.src.includes('.svg')) {
                      e.target.src = `/assets/custom/img/loginsample${num}.svg`;
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Image */}
      <div className="form-row-custom">
        <label className="form-label">Background image for login</label>
        <div className="file-upload-row">
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0], 'bg')}
              disabled={isAdmin}
              className="file-input"
              id="bgUpload"
            />
            <label htmlFor="bgUpload" className="file-label">
              <UploadIcon size={16} /> Choose a file
            </label>
            <p className="file-hint">Background size usually between 150 KB to 500 KB. File format need to upload PNG, JPG only.</p>
            {bgError && <small className="error-text">{bgError}</small>}
          </div>
          <div className="preview-box large">
            <img src={bgPreview || '/assets/custom/img/logo.jpg'} alt="Background Preview" className="preview-img" />
          </div>
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">Terms & Condition url <span className="required">*</span></label>
          <div className="domain-input-group">
            <select value={termProtocol} onChange={(e) => setTermProtocol(e.target.value)} className="protocol-select">
              <option value="http://">http://</option>
              <option value="https://">https://</option>
            </select>
            <Input
              value={termUrl}
              onChange={(e) => { setTermUrl(e.target.value); setTermError(''); }}
              placeholder="Enter Terms URL"
              disabled={isAdmin}
            />
          </div>
          {termError && <small className="error-text">{termError}</small>}
        </div>
        <div className="half">
          <label className="form-label">Privacy Policy <span className="required">*</span></label>
          <div className="domain-input-group">
            <select value={policyProtocol} onChange={(e) => setPolicyProtocol(e.target.value)} className="protocol-select">
              <option value="http://">http://</option>
              <option value="https://">https://</option>
            </select>
            <Input
              value={policyUrl}
              onChange={(e) => { setPolicyUrl(e.target.value); setPolicyError(''); }}
              placeholder="Enter Policy URL"
              disabled={isAdmin}
            />
          </div>
          {policyError && <small className="error-text">{policyError}</small>}
        </div>
      </div>

      {/* Save/Cancel */}
      <div className="form-actions">
        <Button className="cancel-btn" disabled={isAdmin}>Cancel</Button>
        <Button type="primary" icon={<Save size={14} />} onClick={handleSave} loading={saving} disabled={isAdmin} className="save-btn">
          Save
        </Button>
      </div>

      {/* Verify Domain Modal */}
      <Modal
        title="Verify domain ownership via TXT record in DNS"
        open={verifyModalVisible}
        onCancel={() => setVerifyModalVisible(false)}
        footer={[
          <Button key="later" onClick={() => setVerifyModalVisible(false)}>Verify Later</Button>,
          <Button key="verify" type="primary" onClick={handleVerifyConfirm} loading={verifyStatus === 'verifying'}>Verify</Button>,
        ]}
        className="verify-modal"
      >
        {verifyStatus === 'verifying' && (
          <div className="verify-status">
            <Spin />
            <p>Domain verification is in progress. This may take some time.</p>
            <p className="countdown">{countdown}s</p>
          </div>
        )}
        {verifyStatus === 'success' && (
          <div className="verify-status success">
            <CheckCircle size={48} color="#22c55e" />
            <p>Domain is verified successfully.</p>
          </div>
        )}
        {verifyStatus === 'failed' && (
          <div className="verify-status failed">
            <AlertCircle size={48} color="#ef4444" />
            <p>We couldn't find your verification token. Please wait and retry after a few hours.</p>
          </div>
        )}
        {!verifyStatus && (
          <div className="verify-instructions">
            <ul>
              <li>Sign in to your domain name provider (e.g. godaddy.com or namecheap.com)</li>
              <li>Copy the TXT record below into the DNS configuration
                <Input value={verifyDomainValue} readOnly className="mt-2" addonAfter={<span style={{cursor:'pointer'}} onClick={() => {navigator.clipboard.writeText(verifyDomainValue); message.success('Copied!');}}>Copy</span>} />
              </li>
              <li><strong>Once done, please click the verify button</strong></li>
              <li><strong>Note:</strong> DNS changes may take some time to apply.</li>
            </ul>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title="Theme Preview"
        open={previewImageModalVisible}
        onCancel={() => setPreviewImageModalVisible(false)}
        footer={null}
        width={800}
        className="image-preview-modal"
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img
            src={previewImageUrl}
            alt="Theme Preview"
            style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
            onError={(e) => {
              if (!e.target.src.includes('.svg')) {
                const num = previewImageUrl.match(/loginsample(\d)/)?.[1];
                if (num) {
                  e.target.src = `/assets/custom/img/loginsample${num}.svg`;
                }
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default WebPortalTab;

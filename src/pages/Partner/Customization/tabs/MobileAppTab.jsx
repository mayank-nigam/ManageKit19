import React, { useState, useEffect } from 'react';
import { Button, Input, Upload, message } from 'antd';
import { Save, Upload as UploadIcon } from 'lucide-react';

import { getSession } from '../../../../getSession';

const MobileAppTab = ({ data, onSave, onUploadFile, saving, resellerId }) => {
  const { userId } = getSession();
  const isAdmin = userId === 335;

  const [displayName, setDisplayName] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [emailId, setEmailId] = useState('');
  const [colorCode, setColorCode] = useState('#FF5733');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoError, setLogoError] = useState('');

  const [displayNameError, setDisplayNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');

  const DOCS_URL = 'https://docs.kit19.com';

  useEffect(() => {
    if (data) {
      setDisplayName(data.DisplayName || '');
      setWhatsappNo(data.WhatsappNo || '');
      setMobileNo(data.MobileNo || '');
      setEmailId(data.EmailId || '');
      if (data.ColorCode) {
        setColorCode(data.ColorCode);
      }
      if (data.LogoUrl) {
        setLogoPreview(`${DOCS_URL}/assets/custom/partner/resource/${resellerId}/${data.LogoUrl}`);
        setLogoFileName(data.LogoUrl);
      }
    }
  }, [data, resellerId]);

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

  const validateEmail = (value) => {
    if (!value) return '';
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(value) ? '' : 'Invalid email address';
  };

  const handleDisplayNameChange = (e) => {
    const val = e.target.value;
    setDisplayName(val);
    if (val.length > 15) {
      setDisplayNameError('Display name should not exceed 15 characters.');
    } else if (!val) {
      setDisplayNameError('Enter display name');
    } else {
      setDisplayNameError('');
    }
  };

  const handleMobileChange = (e) => {
    const val = e.target.value;
    setMobileNo(val);
    setMobileError(validateMobile(val));
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmailId(val);
    setEmailError(validateEmail(val));
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Invalid file type. Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
      setLogoFile(file);
      setLogoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName) { setDisplayNameError('Enter display name'); return; }
    if (displayName.length > 15) { setDisplayNameError('Display name should not exceed 15 characters.'); return; }
    if (mobileError || emailError) { message.error('Please fix validation errors'); return; }

    if (logoFile) {
      const uploadResult = await onUploadFile(logoFile);
      if (!uploadResult.success) return;
    }

    const params = {
      MobileAppLogo: logoFileName || '',
      DisplayNmae: displayName,
      ColorCode: colorCode,
      MobileNm: mobileNo,
      EmailId: emailId,
      Whatsapp: whatsappNo,
    };
    onSave(params);
  };

  return (
    <div className="tab-content">
      {/* Logo */}
      <div className="form-row-custom">
        <label className="form-label">Logo</label>
        <div className="file-upload-row">
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              disabled={isAdmin}
              className="file-input"
              id="mobileLogoUpload"
            />
            <label htmlFor="mobileLogoUpload" className="file-label">
              <UploadIcon size={16} /> Choose a file
            </label>
            <p className="file-hint">Logo size usually between 20 KB and 150 KB. file size is (96px X 96px). PNG file format need to upload.</p>
            {logoError && <small className="error-text">{logoError}</small>}
          </div>
          <div className="preview-box">
            <img src={logoPreview || '/assets/custom/img/logo.jpg'} alt="Logo Preview" className="preview-img" />
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">Display Name <span className="required">*</span></label>
          <Input
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="Enter Display Name upto 15 characters"
            disabled={isAdmin}
          />
          {displayNameError && <small className="error-text">{displayNameError}</small>}
        </div>
        <div className="half">
          <label className="form-label">Whatsapp No <span className="required">*</span></label>
          <Input
            value={whatsappNo}
            onChange={(e) => setWhatsappNo(e.target.value)}
            placeholder="Enter Whatsapp No"
            disabled={isAdmin}
          />
        </div>
      </div>

      {/* Mobile & Email */}
      <div className="form-row-custom dual">
        <div className="half">
          <label className="form-label">MobileNo <span className="required">*</span></label>
          <Input
            value={mobileNo}
            onChange={handleMobileChange}
            placeholder="Enter Mobile No"
            disabled={isAdmin}
          />
          {mobileError && <small className="error-text">{mobileError}</small>}
        </div>
        <div className="half">
          <label className="form-label">Email <span className="required">*</span></label>
          <Input
            value={emailId}
            onChange={handleEmailChange}
            placeholder="Enter EmailId"
            disabled={isAdmin}
          />
          {emailError && <small className="error-text">{emailError}</small>}
        </div>
      </div>

      {/* Color Picker */}
      <div className="form-row-custom">
        <label className="form-label">Color</label>
        <div className="color-picker-row">
          <input
            type="color"
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
            className="color-picker-input"
            disabled={isAdmin}
          />
          <span className="color-preview" style={{ backgroundColor: colorCode }} />
          <Input
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
            style={{ width: 120 }}
            disabled={isAdmin}
          />
        </div>
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

export default MobileAppTab;

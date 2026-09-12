import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Input, Select, Button, Steps } from 'antd';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { COUNTRY_CODES } from '../../../../config/constants';
import API_ENDPOINTS from '../../../../config/apiEndpoints';
import { getSession } from '../../../../getSession';
import { checkAvailability } from '../mockData/mockUserApi';
import { mockTimezones } from '../mockData/mockUsers';

const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9-]+$/;

const emptyStep2 = {
  username: '',
  firstName: '',
  lastName: '',
  companyName: '',
  country: null,
  state: null,
  city: null,
  timezone: null,
};

const AddUserWizard = ({ open, onClose, onSave }) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [step1Errors, setStep1Errors] = useState({});

  const [step2, setStep2] = useState(emptyStep2);
  const [step2Errors, setStep2Errors] = useState({});

  // API Data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.INVOICE.GET_COUNTRY}`,
        {
          Token: getSession().TokenId,
          LoggedUserId: String(userId || ''),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: {},
        }
      );
      const data = res.data?.Details ? (Array.isArray(res.data.Details) ? res.data.Details : JSON.parse(res.data.Details)) : [];
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const fetchStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.INVOICE.GET_STATE_BY_COUNTRY}`,
        {
          Token: getSession().TokenId,
          LoggedUserId: String(userId || ''),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: { CountryId: String(countryId) },
        }
      );
      const data = res.data?.Details ? (Array.isArray(res.data.Details) ? res.data.Details : JSON.parse(res.data.Details)) : [];
      setStates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch states:', err);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    try {
      const { userId } = getSession();
      const res = await axios.post(
        `${API_BASE}${API_ENDPOINTS.INVOICE.GET_CITY_BY_STATE}`,
        {
          Token: getSession().TokenId,
          LoggedUserId: String(userId || ''),
          Message: '',
          MAC_Address: '',
          IP_Address: '',
          Details: { StateId: String(stateId) },
        }
      );
      const data = res.data?.Details ? (Array.isArray(res.data.Details) ? res.data.Details : JSON.parse(res.data.Details)) : [];
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const reset = () => {
    setStep(0);
    setEmail('');
    setDialCode('+91');
    setMobile('');
    setStep1Errors({});
    setStep2(emptyStep2);
    setStep2Errors({});
    setStates([]);
    setCities([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleContinue = () => {
    const errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Invalid email address';
    if (!mobile || mobile.length < 6) errors.mobile = 'Invalid mobile no';

    if (Object.keys(errors).length === 0) {
      const { emailTaken } = checkAvailability({ email });
      if (emailTaken) errors.email = 'This email is already registered';
    }

    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) setStep(1);
  };

  const handleSave = async () => {
    const errors = {};
    if (!step2.username) errors.username = 'Username is required';
    else if (!USERNAME_RE.test(step2.username)) errors.username = 'Only alphanumeric characters and hyphens are allowed';
    if (!step2.firstName) errors.firstName = 'First name is required';
    if (!step2.country) errors.country = 'Country is required';
    if (!step2.state) errors.state = 'State is required';
    if (!step2.city) errors.city = 'City is required';
    if (!step2.timezone) errors.timezone = 'Timezone is required';

    if (Object.keys(errors).length === 0) {
      const { usernameTaken } = checkAvailability({ username: step2.username });
      if (usernameTaken) errors.username = 'This username is already taken';
    }

    setStep2Errors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const res = await onSave({
      email,
      dialCode,
      countryIso: 'IN',
      mobile,
      ...step2,
    });
    setSaving(false);

    if (res?.Status === 1) {
      handleClose();
    } else {
      Swal.fire('Error', res?.Message || 'Unable to create user.', 'error');
    }
  };

  return (
    <Drawer
      title="Add User"
      open={open}
      onClose={handleClose}
      width={480}
      className="manage-user-drawer"
      footer={
        step === 0 ? null : (
          <div className="flex justify-between">
            <Button icon={<ArrowLeft size={14} />} onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="primary" className="bg-green-600 hover:bg-green-700 border-green-600" loading={saving} onClick={handleSave}>
              Save
            </Button>
          </div>
        )
      }
    >
      <Steps
        current={step}
        size="small"
        className="mb-6"
        items={[{ title: 'Basic Info' }, { title: 'Profile' }]}
      />

      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <Input
              prefix={<Mail size={14} className="text-gray-400" />}
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              status={step1Errors.email ? 'error' : ''}
            />
            {step1Errors.email && <div className="text-xs text-red-500 mt-1">{step1Errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Select
                value={dialCode}
                onChange={setDialCode}
                style={{ width: 100 }}
                options={COUNTRY_CODES.map((c) => ({ label: c.code, value: c.code }))}
              />
              <Input
                prefix={<Phone size={14} className="text-gray-400" />}
                placeholder="Enter Mobile No"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                status={step1Errors.mobile ? 'error' : ''}
              />
            </div>
            {step1Errors.mobile && <div className="text-xs text-red-500 mt-1">{step1Errors.mobile}</div>}
          </div>

          <Button type="primary" block className="bg-green-600 hover:bg-green-700 border-green-600" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Field label="Username" required error={step2Errors.username}>
            <Input value={step2.username} onChange={(e) => setStep2((s) => ({ ...s, username: e.target.value }))} placeholder="Enter Username" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required error={step2Errors.firstName}>
              <Input value={step2.firstName} onChange={(e) => setStep2((s) => ({ ...s, firstName: e.target.value }))} />
            </Field>
            <Field label="Last Name">
              <Input value={step2.lastName} onChange={(e) => setStep2((s) => ({ ...s, lastName: e.target.value }))} />
            </Field>
          </div>
          <Field label="Company Name">
            <Input value={step2.companyName} onChange={(e) => setStep2((s) => ({ ...s, companyName: e.target.value }))} />
          </Field>
          <div className="location-fields-highlight grid grid-cols-2 gap-4">
            <Field label="Country" required error={step2Errors.country}>
              <Select
                className="w-full"
                placeholder="Select Country"
                loading={loadingCountries}
                value={step2.country}
                onChange={(v) => {
                  setStep2((s) => ({ ...s, country: v, state: null, city: null }));
                  fetchStates(v);
                }}
                options={countries.map((c) => ({
                  label: c.Text || c.CountryName || c.name,
                  value: c.Id || c.CountryId
                }))}
              />
            </Field>
            <Field label="State" required error={step2Errors.state}>
              <Select
                className="w-full"
                placeholder="Select State"
                loading={loadingStates}
                value={step2.state}
                disabled={!step2.country}
                onChange={(v) => {
                  setStep2((s) => ({ ...s, state: v, city: null }));
                  fetchCities(v);
                }}
                options={states.map((s) => ({
                  label: s.Text || s.StateName || s.name,
                  value: s.Id || s.StateId
                }))}
              />
            </Field>
            <Field label="City" required error={step2Errors.city}>
              <Select
                className="w-full"
                placeholder="Select City"
                loading={loadingCities}
                value={step2.city}
                disabled={!step2.state}
                onChange={(v) => setStep2((s) => ({ ...s, city: v }))}
                options={cities.map((c) => ({
                  label: c.Text || c.CityName || c.name || c,
                  value: c.Id || c.CityId
                }))}
              />
            </Field>
            <Field label="Timezone" required error={step2Errors.timezone}>
              <Select
                className="w-full"
                placeholder="Select Timezone"
                value={step2.timezone}
                onChange={(v) => setStep2((s) => ({ ...s, timezone: v }))}
                options={mockTimezones.map((t) => ({ label: t, value: t }))}
              />
            </Field>
          </div>
        </div>
      )}
    </Drawer>
  );
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);

export default AddUserWizard;

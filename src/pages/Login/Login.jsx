import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL_NEW || 'http://localhost:62194/';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        Status: '',
        Message: '',
        Details: {
          LoginName: values.username || '',
          Password: values.password || '',
          Url: window.location.hostname || 'www.kit19.com',
          DeviceId: '10-60-4B-7A-92-E5'
        }
      };

      const response = await fetch(`${NEWV3_BASE_URL}Admin/GetDeviceToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
        
        // Extract the Token manually using Regex to preserve full integer precision
        // Standard JSON.parse rounds large numbers (> 9007199254740991)
        const tokenMatch = rawText.match(/"Token"\s*:\s*(-?\d+)/);
        if (tokenMatch && tokenMatch[1] && data && data.Details) {
            data.Details.Token = tokenMatch[1]; // Store as exact string
        }
      } catch (e) {
        console.error('Failed to parse login response safely', e);
        data = JSON.parse(rawText); // fallback
      }
      
      const authResponse = data?.Details?.AuthenticationResponse;
      
      if (data && data.Status === 1 && authResponse?.Id === 1) {
        const userData = data.Details;
        
        // Exact validation requested for child users!
        if (userData.ParentID !== userData.User_ID) {
          message.error({
            content: 'Access Denied: Child users are restricted from accessing the Management Portal.',
            duration: 5
          });
          setLoading(false);
          return;
        }

        // Parent User Success!
        localStorage.setItem("API_TOKEN", userData.Token);
        localStorage.setItem("USER_ID", userData.User_ID);
        localStorage.setItem('LoginName', values.username);
        
        // Make Logo and Username dynamically available across the app
        if (userData.Logo) localStorage.setItem('Logo', userData.Logo);
        if (userData.FName) localStorage.setItem('FName', userData.FName);
        if (userData.LName) localStorage.setItem('LName', userData.LName);
        if (userData.CompanyName || userData.DisplayName) {
          localStorage.setItem('CompanyName', userData.CompanyName || userData.DisplayName);
        }
        
        message.success('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 500);

      } else {
        message.error(authResponse?.Text || data.Message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* Left hero (Adapted for Management project) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#2a9629] text-white p-12">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-4">Welcome to Kit19 Management</h2>
          <p className="mb-6 opacity-90">Manage roles, permissions, teams, and system configurations.</p>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-white mr-3" />
              <span className="font-medium">Role & Permission Management</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-white mr-3" />
              <span className="font-medium">Team & Collaborator Setup</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-white mr-3" />
              <span className="font-medium">System Configuration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to Kit19 Management</h1>
            <p className="text-gray-600">Enter your credentials to access the dashboard</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <Form
              name="normal_login"
              className="login-form space-y-4"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label={<span className="font-medium text-gray-700">User Name</span>}
                rules={[{ required: true, message: 'Please input your User Name!' }]}
                className="mb-4"
              >
                <Input 
                  placeholder="e.g. admin" 
                  className="rounded-lg h-11"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label={<span className="font-medium text-gray-700">Password</span>}
                rules={[{ required: true, message: 'Please input your Password!' }]}
                className="mb-6"
              >
                <Input.Password
                  type="password"
                  placeholder="••••••••"
                  className="rounded-lg h-11"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-2">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full rounded-lg h-11 text-base font-medium shadow-sm transition-colors border-none"
                  style={{ backgroundColor: '#2a9629' }}
                  loading={loading}
                >
                  Log In
                </Button>
              </Form.Item>
            </Form>
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Copyright © {new Date().getFullYear()} KIT19. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

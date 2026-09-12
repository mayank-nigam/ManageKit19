import React, { useState, useEffect, useCallback } from 'react';
import { Button, Radio } from 'antd';
import { Download, Plus, RefreshCw, CreditCard, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import { formatDateToDDMmmYYYY } from '../ManageUser/utils/formatDate';

import LicenceGrid from './components/LicenceGrid';
import AddTransactionDrawer from './components/AddTransactionDrawer';

import '../shared/PartnerCommon.css';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

const LicenceTransaction = () => {
  const [licenceType, setLicenceType] = useState('Monthly');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [annualBalance, setAnnualBalance] = useState(0);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.LICENCE_TRANSACTION.GET_LIST}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: {
          UserId: String(userId || ''),
          LicenceType: licenceType,
        },
      });

      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      setTransactions(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [licenceType]);

  // Calculate balance on this page (sum of all transactions shown)
  const calculatePageBalance = useCallback(() => {
    const pageBalance = transactions.reduce((sum, transaction) => {
      const credit = parseInt(transaction.Credit || 0);
      const debit = parseInt(transaction.Debit || 0);
      return sum + credit - debit;
    }, 0);
    return Math.abs(pageBalance);
  }, [transactions]);

  const fetchMonthlyBalance = useCallback(async () => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.LICENCE_TRANSACTION.GET_MONTHLY_BALANCE}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { UserId: String(userId || '') },
      });

      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      const balance = Array.isArray(parsed) ? parsed[0] : parsed;
      // Use page balance if available, otherwise use API response
      setMonthlyBalance(licenceType === 'Monthly' ? calculatePageBalance() : (balance?.MonthlyBalance || 0));
    } catch (err) {
      console.error('Failed to fetch monthly balance:', err);
      setMonthlyBalance(calculatePageBalance());
    }
  }, [licenceType, calculatePageBalance]);

  const fetchAnnualBalance = useCallback(async () => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.LICENCE_TRANSACTION.GET_ANNUAL_BALANCE}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { UserId: String(userId || '') },
      });

      const parsed = typeof res.data?.Details === 'string' ? JSON.parse(res.data.Details) : res.data?.Details || [];
      const balance = Array.isArray(parsed) ? parsed[0] : parsed;
      // Use page balance if available, otherwise use API response
      setAnnualBalance(licenceType === 'Annual' ? calculatePageBalance() : (balance?.AnnualBalance || 0));
    } catch (err) {
      console.error('Failed to fetch annual balance:', err);
      setAnnualBalance(calculatePageBalance());
    }
  }, [licenceType, calculatePageBalance]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchMonthlyBalance();
    fetchAnnualBalance();
  }, [fetchMonthlyBalance, fetchAnnualBalance]);

  const handleLicenceTypeChange = (e) => {
    setLicenceType(e.target.value);
  };

  const handleRefresh = () => {
    fetchTransactions();
    fetchMonthlyBalance();
    fetchAnnualBalance();
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      Swal.fire('Info', 'No data available to export.', 'info');
      return;
    }

    const header = ['Date', 'Created By', 'From User', 'To User', 'Credit', 'Debit', 'Balance', 'Remarks'];
    const csvRows = transactions.map((row) => [
      formatDateToDDMmmYYYY(row.CreatedOn),
      row.CreatedByName,
      row.FromUserName,
      row.ToUserName,
      row.Credit,
      row.Debit,
      row.Balance,
      row.Remarks,
    ]);

    const csv = [header, ...csvRows].map((r) => r.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LicenceTransactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddTransaction = async (payload) => {
    try {
      const { token, userId, TokenId } = getSession();
      const res = await axios.post(`${API_BASE}${API_ENDPOINTS.LICENCE_TRANSACTION.ADD}`, {
        Token: token || TokenId,
        LoggedUserId: String(userId || ''),
        Message: '',
        MAC_Address: '',
        IP_Address: '',
        Details: { objCreditAdd: payload },
      });

      if (res.data?.Details === 'Success') {
        Swal.fire({ icon: 'success', title: 'Transaction added successfully', timer: 2000, showConfirmButton: false });
        setAddDrawerOpen(false);
        fetchTransactions();
        fetchMonthlyBalance();
        fetchAnnualBalance();
        return { Status: 1 };
      } else {
        Swal.fire('Error', res.data?.Details || 'Failed to add transaction', 'error');
        return { Status: 0, Message: res.data?.Details };
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
      Swal.fire('Error', 'Failed to add transaction', 'error');
      return { Status: 0, Message: err.message };
    }
  };

  return (
    <div className="licence-transaction-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Licence Transaction</h1>
          <p className="page-subtitle">Track and manage licence transfers between users.</p>
        </div>
        <div className="page-header-actions">
          <Button icon={<Download size={15} />} onClick={handleExport} className="export-btn">
            Export
          </Button>
          <Button
            type="primary"
            icon={<Plus size={15} />}
            className="add-btn"
            onClick={() => setAddDrawerOpen(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="balance-cards-row">
        <div className="balance-card monthly">
          <div className="balance-card-icon">
            <Calendar size={20} />
          </div>
          <div className="balance-card-content">
            <span className="balance-card-label">Monthly Balance (This Page)</span>
            <span className="balance-card-value">{licenceType === 'Monthly' ? calculatePageBalance() : monthlyBalance}</span>
          </div>
        </div>
        <div className="balance-card annual">
          <div className="balance-card-icon">
            <TrendingUp size={20} />
          </div>
          <div className="balance-card-content">
            <span className="balance-card-label">Annual Balance (This Page)</span>
            <span className="balance-card-value">{licenceType === 'Annual' ? calculatePageBalance() : annualBalance}</span>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-left">
          <Radio.Group
            value={licenceType}
            onChange={handleLicenceTypeChange}
            className="licence-type-radio"
          >
            <Radio.Button value="Monthly">Monthly</Radio.Button>
            <Radio.Button value="Annual">Annual</Radio.Button>
          </Radio.Group>
        </div>
        <div className="toolbar-right">
          <Button
            icon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            className="refresh-btn"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="table-card">
        <LicenceGrid
          data={transactions}
          loading={loading}
        />
      </div>

      <AddTransactionDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSave={handleAddTransaction}
        licenceType={licenceType}
      />
    </div>
  );
};

export default LicenceTransaction;

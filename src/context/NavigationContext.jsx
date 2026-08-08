import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession } from '../getSession';
import API_ENDPOINTS from '../config/apiEndpoints';
import {
  FiHome, FiUsers, FiUserPlus, FiCalendar, FiPhone, FiTarget,
  FiCheckSquare, FiMapPin, FiActivity, FiStar, FiTrello, FiClock,
  FiFileText, FiDollarSign, FiCreditCard, FiBook, FiChevronRight, FiSettings, FiLayout, FiTrendingUp, FiFile, FiPercent, FiImage, FiRadio, FiLink, FiShield
} from 'react-icons/fi';
import { CopyPlus, ListFilterPlus, Merge } from 'lucide-react';

const MENU_MAPPING = {
  'Dashboard': { name: 'Dashboard', href: '/', icon: FiHome },
  'Enquiries': { name: 'Enquiries', href: '/enquiries', icon: FiUsers },
  'Merge Duplicate Enquiry': { name: 'Merge Duplicate', href: '/MergeDuplicate', icon: Merge },
  'Leads': { name: 'Leads', href: '/leads', icon: FiUserPlus },
  'Conversions': { name: 'Conversions', href: '/conversions', icon: FiTarget },
  'Follow-ups': { name: 'Follow-ups', href: '/follow-ups', icon: FiCalendar },
  'Segmentation': { name: 'Segmentation', href: '/segments', icon: FiUsers },
  'Call List': { name: 'Call List', href: '/call-list', icon: FiPhone },
  'Tasks': { name: 'Task', href: '/tasks', icon: FiCheckSquare },
  'Appointments': { name: 'Appointments', href: '/appointments', icon: FiCalendar },
  'Physical Appointments': { name: 'Physical Appointments', href: '/physical-appointments', icon: FiMapPin },
  'Lead Activities': { name: 'Lead Activities', href: '/activities', icon: FiActivity },
  'Custom Events': { name: 'Custom Events', href: '#', icon: FiStar },
  'Create Event': { name: 'Create Event', href: '/custom-events/create', icon: CopyPlus },
  'Webhook Events': { name: 'Webhook Events', href: '/custom-events/webhook', icon: ListFilterPlus },
  'Webook Events': { name: 'Webhook Events', href: '/custom-events/webhook', icon: ListFilterPlus },
  'Pipeline Deal': { name: 'Pipeline Deal', href: '/pipeline-deal', icon: FiTrello },
  'Pipeline History': { name: 'Pipeline History', href: '/pipeline-history', icon: FiClock },
  'Quotations': { name: 'Quotations', href: '/quotations', icon: FiFileText },
  'Invoices': { name: 'Invoices', href: '/invoices', icon: FiFileText },
  'Revenue': { name: 'Revenue', href: '/revenue', icon: FiDollarSign },
  'Credit Note': { name: 'Credit Notes', href: '/credit-notes', icon: FiCreditCard },
  'Customer Ledger': { name: 'Customer Ledger', href: '/ledger', icon: FiBook },

  // Reports
  'Reports': { name: 'Reports', href: '#', icon: FiLayout },
  'Enquiry Report': { name: 'Enquiry Report', href: '/report-pages/enquiry-report', icon: FiFileText },
  'Sales Target': { name: 'Sales Target', href: '/sales-target', icon: FiTarget },
  'Lead Report': { name: 'Lead Report', href: '/report-pages/lead-report', icon: FiFileText },
  'Email Report': { name: 'Email Report', href: '#', icon: FiActivity }, // Or leave it if it exists
  'Call Report': { name: 'Call Report', href: '/report-pages/call-report', icon: FiPhone },
  'Usage Report': { name: 'Usage Report', href: '/report-pages/usage-report', icon: FiActivity },
  'Call Detail': { name: 'Call Detail', href: '/report-pages/call-detail', icon: FiPhone },
  'Followup Report': { name: 'Followup Report', href: '/report-pages/followup-report', icon: FiClock },
  'Whatsapp Dashboard': { name: 'Whatsapp Dashboard', href: '/report-pages/whatsapp-subscription', icon: FiActivity },
  'Mass Operation Status': { name: 'Mass Operation Status', href: '/report-pages/mass-operation-status', icon: FiActivity },
  'Download Centre': { name: 'Download Centre', href: '#', icon: FiFileText },
  
  // Subscriber nested reports
  'Subscriber': { name: 'Subscriber', href: '#', icon: FiUsers },
  'Email Subscriber List': { name: 'Email Subscriber List', href: '/report-pages/email-subscription', icon: FiActivity },
  'Whatsapp Subscribe List': { name: 'Whatsapp Subscribe List', href: '/report-pages/whatsapp-subscription', icon: FiActivity },

  // Other Root Modules & Features
  'Sales': { name: 'Sales', href: '#', icon: FiTrendingUp },
  'Marketing': { name: 'Marketing', href: '#', icon: FiTrendingUp },
  'Productivity': { name: 'Productivity', href: '#', icon: FiActivity },
  'Service': { name: 'Service', href: '#', icon: FiPhone },
  'Tools': { name: 'Tools', href: '#', icon: FiSettings },
  'Telephony': { name: 'Telephony', href: '#', icon: FiPhone },
  'Whatsapp Business Platform': { name: 'Whatsapp Business Platform', href: '#', icon: FiPhone },
  'Unified Broadcast': { name: 'Unified Broadcast', href: '#', icon: FiActivity },
  'AI': { name: 'AI', href: '#', icon: FiStar },
  'AI Studio': { name: 'AI Studio', href: '#', icon: FiStar },
  'Employee Time Tracking': { name: 'Employee Time Tracking', href: '#', icon: FiClock },
  'AI Tool': { name: 'AI Tool', href: '#', icon: FiStar },
  'AI Report': { name: 'AI Report', href: '#', icon: FiFileText },
  'Company Settings': { name: 'Company Settings', href: '#', icon: FiSettings },
  'Branch settings': { name: 'Branch settings', href: '#', icon: FiSettings },
  'Support Management': { name: 'Support Management', href: '#', icon: FiPhone },

  // Settings
  'Settings': { name: 'Settings', href: '#', icon: FiSettings },
  'Geofence': { name: 'Geofence', href: '#', icon: FiMapPin },
  'Business': { name: 'Business', href: '#', icon: FiSettings },
  'General': { name: 'General', href: '#', icon: FiSettings },
  'HR': { name: 'HR', href: '#', icon: FiUsers },
  'Users': { name: 'Users', href: '#', icon: FiUsers },
  'Location': { name: 'Location', href: '#', icon: FiMapPin },
  'Sales & Marketing': { name: 'Sales & Marketing', href: '#', icon: FiTrendingUp },

  'User Setting': { name: 'User Setting', href: '#', icon: FiUsers },
  'Roles & Rights': { name: 'Roles & Rights', href: '#', icon: FiUserPlus },
  'Hierarchy': { name: 'Hierarchy', href: '/master-settings/user-hierarchy', icon: FiUsers },
  'Territory': { name: 'Territory', href: '#', icon: FiMapPin },
  'User Login Status': { name: 'User Login Status', href: '#', icon: FiUsers },
  'User Roster': { name: 'User Roster', href: '#', icon: FiUsers },

  'Basic': { name: 'Basic', href: '#', icon: FiFileText },
  'Capture Leads': { name: 'Capture Leads', href: '#', icon: FiUsers },

  'Source': { name: 'Source', href: '/master-settings/user-source-settings', icon: FiTarget },
  'Medium': { name: 'Medium', href: '/master-settings/medium-settings', icon: FiActivity },
  'Campaign': { name: 'Campaign', href: '/master-settings/campaign-settings', icon: FiTrendingUp },
  'Mail': { name: 'Mail', href: '/master-settings/mail-settings', icon: FiActivity },
  'Lead Assignment Master': { name: 'Lead Assignment Master', href: '/master-settings/lead-assignment-master', icon: FiUsers },
  'Field Masking': { name: 'Field Masking', href: '/master-settings/field-masking', icon: FiFileText },

  'Sales Activities': { name: 'Sales Activities', href: '#', icon: FiActivity },
  'Followup Settings': { name: 'Followup Settings', href: '/master-settings/followup-settings', icon: FiClock },
  'Pipeline Settings': { name: 'Pipeline Settings', href: '/master-settings/pipeline-settings', icon: FiTrello },
  'Call Dialer Setting': { name: 'Call Dialer Setting', href: '/master-settings/call-dialer-settings', icon: FiPhone },
  'Task Settings': { name: 'Task Settings', href: '/master-settings/task-settings', icon: FiCheckSquare },
  'Task': { name: 'Task Setting', href: '/master-settings/task-settings', icon: FiCheckSquare },
  'Entity Approval Setting': { name: 'Entity Approval Setting', href: '/master-settings/entity-approval-settings', icon: FiCheckSquare },
  'Approval Setting': { name: 'Entity Approval Setting', href: '/master-settings/entity-approval-settings', icon: FiCheckSquare },
  'Approval setting': { name: 'Entity Approval Setting', href: '/master-settings/entity-approval-settings', icon: FiCheckSquare },
  'Custom Button Setting': { name: 'Custom Button Setting', href: '/settings/custom-button', icon: FiSettings },

  'Invoice Setting': { name: 'Invoice Setting', href: '#', icon: FiFileText },
  'Payment Method': { name: 'Payment Method', href: '/master-settings/payment-method', icon: FiCreditCard },
  'Invoice Settings': { name: 'Invoice Settings', href: '/master-settings/invoice-settings', icon: FiFileText },
  'Quotation Settings': { name: 'Quotation Settings', href: '/master-settings/quotation-settings', icon: FiFile },
  'Tax Settings': { name: 'Tax Settings', href: '/master-settings/tax-settings', icon: FiPercent },
  'Credit Note Settings': { name: 'Credit Note Settings', href: '/credit-notes/settings', icon: FiCreditCard },

  'User Role': { name: 'User Role', href: '/roles/user-role', icon: FiUserPlus },
  'Manage Team': { name: 'Manage Team', href: '#', icon: FiUsers },
  'Team Master': { name: 'Team Master', href: '/roles/team-master', icon: FiUsers },
  'User Role Mapping': { name: 'User Role Mapping', href: '/roles/user-role-mapping', icon: FiLink },
  'Role Permission Mapping': { name: 'Role Permission Mapping', href: '/roles/role-permission-mapping', icon: FiShield },
  'Field Masking': { name: 'Field Masking', href: '/roles/field-masking', icon: FiLayout },
  // 'Collaborator Team': { name: 'Collaborator Team', href: '/master-settings/collaborator-team', icon: FiUsers },
  // 'CollaboratorType': { name: 'CollaboratorType', href: '/master-settings/collaborator-type', icon: FiUsers },
  'User Hierarchy': { name: 'User Hierarchy', href: '/master-settings/user-hierarchy', icon: FiUsers }
};

const NavigationContext = createContext();

let globalFetchedMenuUserId = null;

export const NavigationProvider = ({ children }) => {
  const [navigation, setNavigation] = useState([{ name: 'Dashboard', href: '/', icon: FiHome }]);
  const [loadingNav, setLoadingNav] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState(['/']);
  const [modulePermissions, setModulePermissions] = useState([]);
  const [currentPageCode, setCurrentPageCode] = useState("");

  const fetchMenu = async (silent = false) => {
    if (!silent) setLoadingNav(true);
    try {
      // Hardcoded Admin Navigation Structure
      const finalNav = [
        { name: 'Dashboard', href: '/', icon: FiHome },
        ...(getSession().userId === 335 ? [{
          name: 'Settings',
          icon: FiSettings,
          href: '#',
          subItems: [
            // { name: 'General Settings', href: '/settings/general', icon: FiSettings },
            // { name: 'User Management', href: '/settings/users', icon: FiUsers },
            { name: 'Banner Management', href: '/banner', icon: FiImage },
            { name: 'System Updates', href: '/updates', icon: FiRadio },
            { name: 'Help Management', href: '/help', icon: FiBook }
          ]
        }] : []),
        {
          name: 'Roles & Rights',
          icon: FiShield,
          href: '#',
          subItems: [
            { name: 'User Role', href: '/roles/user-role', icon: FiUserPlus },
            { name: 'Team Master', href: '/roles/team-master', icon: FiUsers },
            { name: 'User Role Mapping', href: '/roles/user-role-mapping', icon: FiUsers },
            { name: 'Role Permission Mapping', href: '/roles/role-permission-mapping', icon: FiLayout },
            { name: 'Field Masking', href: '/roles/field-masking', icon: FiLayout },
            ...(getSession().userId === 335 ? [{ name: 'Module Master', href: '/roles/module-master', icon: FiLayout }] : []),
            // { name: 'Collaborator Team', href: '/master-settings/collaborator-team', icon: FiUsers },
            // { name: 'Collaborator Type', href: '/master-settings/collaborator-type', icon: FiUsers }
          ]
        },
        // {
        //   name: 'Reports',
        //   icon: FiLayout,
        //   href: '#',
        //   subItems: [
        //     { name: 'Activity Report', href: '/report-pages/activity', icon: FiActivity }
        //   ]
        // }
      ];

      setNavigation(finalNav);

      // Extract all allowed paths
      const routes = [];
      const extractRoutes = (navItems) => {
        navItems.forEach(curr => {
          if (curr.href && curr.href !== '#') routes.push(curr.href);
          if (curr.subItems) {
            extractRoutes(curr.subItems);
          }
        });
      };
      extractRoutes(finalNav);

      setAllowedRoutes([...routes]);
      setModulePermissions([]); // Can hardcode if needed
    } catch (err) {
      console.error('Error setting sidebar menu:', err);
    } finally {
      if (!silent) setLoadingNav(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const getRoutePermissions = React.useCallback((pathname) => {
    let foundTitle = null;

    // Check main paths
    for (const [title, mapping] of Object.entries(MENU_MAPPING)) {
      if (pathname === mapping.href || pathname.startsWith(mapping.href + '/')) {
        foundTitle = title;
        break;
      }
    }

    if (!foundTitle) return null;

    const normalize = s => (s || '').toLowerCase().replace(/[^a-z]/g, '');
    return modulePermissions.find(m =>
      (m.childName || m.Title) === foundTitle ||
      normalize(m.childName || m.Title) === normalize(foundTitle)
    ) || null;
  }, [modulePermissions]);

  return (
    <NavigationContext.Provider value={{ navigation, loadingNav, allowedRoutes, refetchMenu: () => fetchMenu(true), getRoutePermissions, currentPageCode, setCurrentPageCode }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => useContext(NavigationContext);

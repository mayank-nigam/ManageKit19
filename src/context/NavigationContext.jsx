import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession } from '../getSession';
import API_ENDPOINTS from '../config/apiEndpoints';
import {
  FiHome, FiUsers, FiUserPlus, FiCalendar, FiPhone, FiTarget,
  FiCheckSquare, FiMapPin, FiActivity, FiStar, FiTrello, FiClock,
  FiFileText, FiDollarSign, FiCreditCard, FiBook, FiChevronRight, FiSettings, FiLayout, FiTrendingUp, FiFile, FiPercent, FiImage, FiRadio, FiLink, FiShield, FiCamera
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
  'Manage Team': { name: 'Team Master', href: '/roles/team-master', icon: FiUsers },
  'Team Master': { name: 'Team Master', href: '/roles/team-master', icon: FiUsers },
  'User Role Mapping': { name: 'User Role Mapping', href: '/roles/user-role-mapping', icon: FiLink },
  'Role Permission Mapping': { name: 'Role Permission Mapping', href: '/roles/role-permission-mapping', icon: FiShield },
  'Field Masking': { name: 'Field Masking', href: '/roles/field-masking', icon: FiLayout },
  // 'Collaborator Team': { name: 'Collaborator Team', href: '/master-settings/collaborator-team', icon: FiUsers },
  // 'CollaboratorType': { name: 'CollaboratorType', href: '/master-settings/collaborator-type', icon: FiUsers },
  'User Hierarchy': { name: 'User Hierarchy', href: '/master-settings/user-hierarchy', icon: FiUsers },

  'Partner': { name: 'Partner', href: '#', icon: FiUsers },
  'Manage User': { name: 'Manage User', href: '/partner/manage-user', icon: FiUserPlus },
  'User Segmentation': { name: 'User Segmentation', href: '/partner/user-segmentation', icon: FiLayout },
  'Snapshots': { name: 'Snapshots', href: '/partner/snapshots', icon: FiCamera },
  'Change Partner Requests': { name: 'Change Partner Requests', href: '/partner/change-partner-request', icon: FiLink },
  'Licence Transaction': { name: 'Licence Transaction', href: '/partner/licence-transaction', icon: FiCreditCard },
  'Impersonation Request Received': { name: 'Impersonation Request Received', href: '/partner/impersonation-request-received', icon: FiUsers },
  'Partner Settings': { name: 'Partner Settings', href: '#', icon: FiSettings },
  'Banner': { name: 'Banner', href: '/partner/banner', icon: FiImage },
  'Customization': { name: 'Customization', href: '/partner/customization', icon: FiSettings },
  'Team Roles': { name: 'Team Roles', href: '#', icon: FiShield },
  'Reserve Fund': { name: 'Reserve Fund', href: '/partner/reserve-fund', icon: FiDollarSign },
  'Verify KYC': { name: 'Verify KYC', href: '/partner/verify-kyc', icon: FiCheckSquare }
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
    const { TokenId, userId } = getSession();
    if (globalFetchedMenuUserId === userId && navigation.length > 1) return;
    globalFetchedMenuUserId = userId;

    if (!silent) setLoadingNav(true);
    try {
      const token = TokenId || "-2295521862261168";
      const uid = userId || "34594";
      const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');
      const url = `${API_BASE}${API_ENDPOINTS.COMMON.GET_ALL_HIERARCHICAL_DISPLAY_BY_USER_ID}`;

      const payload = {
        Token: token,
        Details: {
          UserId: String(uid)
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const list = data?.Details || data?.d || data?.Data || data?.data || data || [];
        let parsedList = Array.isArray(list) ? list : (typeof list === 'string' ? JSON.parse(list) : []);

        const buildMenuTree = (parentId, rootTitle) => {
          const children = parsedList.filter(m => (m.parentId ?? m.ParentId) === parentId);
          children.sort((a, b) => (a.Sequence ?? a.sequence ?? 0) - (b.Sequence ?? b.sequence ?? 0));

          const validChildren = children.filter(m => {
            if (m.view ?? m.View === true) return true;
            if (m.Type === 'Module' || m.type === 'Module') {
              const moduleId = m.childId ?? m.MenuId;
              const hasVisibleDescendant = (nodeId) => {
                const sub = parsedList.filter(x => (x.parentId ?? x.ParentId) === nodeId);
                if (sub.some(x => (x.view ?? x.View) === true)) return true;
                return sub.some(x => hasVisibleDescendant(x.childId ?? x.MenuId));
              };
              return hasVisibleDescendant(moduleId);
            }
            return false;
          });

          const rawMapped = validChildren.map(child => {
            const title = child.childName || child.Title;
            const childId = child.childId ?? child.MenuId;
            let mapping = MENU_MAPPING[title] || { name: title, href: '#', icon: FiChevronRight };

            if ((title === 'Tasks' || title === 'Task') && (rootTitle === 'Settings' || rootTitle === 'Setting')) {
               mapping = { name: 'Task Setting', href: '/master-settings/task-settings', icon: FiCheckSquare };
            }

            const subItems = buildMenuTree(childId, rootTitle);

            if (subItems.length > 0) {
              return { ...mapping, description: child.description || child.Description || '', subItems };
            }

            if ((child.Type === 'Module' || child.type === 'Module') && subItems.length === 0) return null;
            if (mapping.href === '#' && subItems.length === 0) return null;

            return { ...mapping, description: child.description || child.Description || '' };
          }).filter(Boolean);

          const uniqueItems = [];
          const seenNames = new Set();
          for (const item of rawMapped) {
            if (!seenNames.has(item.name)) {
              seenNames.add(item.name);
              uniqueItems.push(item);
            }
          }
          return uniqueItems;
        };

        const finalNav = [];
        const dashboard = parsedList.find(m => (m.childName || m.Title) === 'Dashboard');
        if (dashboard && (dashboard.view ?? dashboard.View)) {
          finalNav.push({ name: 'Dashboard', href: '/', icon: FiHome });
        } else {
          finalNav.push({ name: 'Dashboard', href: '/', icon: FiHome });
        }

        // Only allow Dashboard from API. We will append the static menus manually.
        // We do NOT want Sales, Marketing, Reports, etc. to show up here.
        const rootModules = parsedList.filter(m => (m.parentId ?? m.ParentId) === 0);

        rootModules.forEach(root => {
          const title = root.childName || root.Title;
          if (title === 'Dashboard') return; 

          // Filter out everything else
          return;
        });

        // Append static Settings menu
        if (getSession().userId === 335) {
          finalNav.push({
            name: 'Settings',
            icon: FiSettings,
            href: '#',
            subItems: [
              { name: 'Banner Management', href: '/banner', icon: FiImage },
              { name: 'System Updates', href: '/updates', icon: FiRadio },
              { name: 'Help Management', href: '/help', icon: FiBook }
            ]
          });
        }

        // Dynamically append Roles & Rights from API
        const rolesModule = parsedList.find(m => (m.childName || m.Title) === 'Roles & Rights' || (m.childName || m.Title) === 'Roles and Rights');
        if (rolesModule) {
           const subItems = buildMenuTree(rolesModule.childId ?? rolesModule.MenuId, rolesModule.childName || rolesModule.Title);
           
           // Inject Module Master for admin if not present
           if (getSession().userId === 335 && !subItems.find(si => si.href === '/roles/module-master')) {
               subItems.push({ name: 'Module Master', href: '/roles/module-master', icon: FiLayout });
           }

           if (subItems.length > 0 || (rolesModule.view ?? rolesModule.View)) {
              finalNav.push({
                name: 'Roles & Rights',
                icon: FiShield,
                href: '#',
                subItems: subItems.length > 0 ? subItems : undefined
              });
           }
        } else {
           // Fallback in case API completely fails or user doesn't have it, but they are admin
           if (getSession().userId === 335 || getSession().userId === 34594) {
               finalNav.push({
                 name: 'Roles & Rights',
                 icon: FiShield,
                 href: '#',
                 subItems: [
                   { name: 'User Role', href: '/roles/user-role', icon: FiUserPlus },
                   { name: 'Team Master', href: '/roles/team-master', icon: FiUsers },
                   { name: 'User Role Mapping', href: '/roles/user-role-mapping', icon: FiUsers },
                   { name: 'Role Permission Mapping', href: '/roles/role-permission-mapping', icon: FiLayout },
                   { name: 'Field Masking', href: '/roles/field-masking', icon: FiLayout },
                   ...((getSession().userId === 335 ) ? [{ name: 'Module Master', href: '/roles/module-master', icon: FiLayout }] : [])
                 ]
               });
           }
        }

        // Dynamically append Partner from API, fallback to a hardcoded "Manage User"
        // subtree otherwise - same pattern as the Roles & Rights block above, except
        // shown unconditionally (no userId gate) since this is currently in broad
        // review rather than restricted to specific test accounts.
        const partnerFallbackSubItems = [
          { name: 'Manage User', href: '/partner/manage-user', icon: FiUserPlus },
          { name: 'User Segmentation', href: '/partner/user-segmentation', icon: FiLayout },
          { name: 'Snapshots', href: '/partner/snapshots', icon: FiCamera },
          { name: 'Change Partner Requests', href: '/partner/change-partner-request', icon: FiLink },
          { name: 'Licence Transaction', href: '/partner/licence-transaction', icon: FiCreditCard },
          { name: 'Impersonation Request Received', href: '/partner/impersonation-request-received', icon: FiUsers }
        ];
        const partnerModule = parsedList.find(m => (m.childName || m.Title) === 'Partner');
        if (partnerModule) {
          const subItems = buildMenuTree(partnerModule.childId ?? partnerModule.MenuId, partnerModule.childName || partnerModule.Title);
          finalNav.push({
            name: 'Partner',
            icon: FiUsers,
            href: '#',
            subItems: subItems.length > 0 ? subItems : partnerFallbackSubItems
          });
        } else {
          finalNav.push({
            name: 'Partner',
            icon: FiUsers,
            href: '#',
            subItems: partnerFallbackSubItems
          });
        }

        // Partner Settings menu
        finalNav.push({
          name: 'Partner Settings',
          icon: FiSettings,
          href: '#',
          subItems: [
            { name: 'Banner', href: '/partner/banner', icon: FiImage },
            { name: 'Customization', href: '/partner/customization', icon: FiSettings },
            { name: 'Reserve Fund', href: '/partner/reserve-fund', icon: FiDollarSign },
            { name: 'Verify KYC', href: '/partner/verify-kyc', icon: FiCheckSquare },
            {
              name: 'Team Roles',
              icon: FiShield,
              href: '#',
              subItems: [
                { name: 'User Role Mapping', href: '/partner/team-role-mapping', icon: FiLink },
                { name: 'Role Master', href: '/partner/role-master', icon: FiUserPlus }
              ]
            }
          ]
        });

        setNavigation(finalNav);

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

        const settingRoutes = [
           '/roles/user-role',
           '/roles/team-master',
           '/roles/user-role-mapping',
           '/roles/role-permission-mapping',
           '/roles/field-masking',
           '/roles/module-master',
           '/banner',
           '/updates',
           '/help',
'/partner/manage-user',
            '/partner/user-segmentation',
            '/partner/snapshots',
            '/partner/change-partner-request',
            '/partner/licence-transaction',
            '/partner/impersonation-request-received',
              '/partner/banner',
              '/partner/customization',
              '/partner/reserve-fund',
              '/partner/verify-kyc',
              '/partner/team-role-mapping',
             '/partner/role-master'
        ];

        setAllowedRoutes([...routes, ...settingRoutes]);
        setModulePermissions(parsedList);
      }
    } catch (err) {
      console.error('Error fetching sidebar menu:', err);
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

// forcing a rebuild

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiSettings } from 'react-icons/fi';
import { X, Check, Trash2, Mail, MailOpen, Plus, Menu, Megaphone, Rocket, Gift, ArrowUpCircle } from 'lucide-react';
import clsx from 'clsx';
import { THEME } from '../../config/constants';
import { getSession } from '../../getSession';
import { getNotifications } from '../../utils/lead';
import UpdateWidget from '../common/UpdateWidget/UpdateWidget';
import API_ENDPOINTS from '../../config/apiEndpoints';
import { useNavigationContext } from '../../context/NavigationContext';

// Theme Component Imports

const findPageName = (items, path) => {
  if (!items) return null;
  for (const item of items) {
    if (item.href === path || (item.href !== '/' && item.href !== '#' && path.startsWith(item.href + '/'))) {
      return item.name;
    }
    if (item.subItems) {
      const found = findPageName(item.subItems, path);
      if (found) return found;
    }
  }
  return null;
};

const WCF_BASE = (process.env.REACT_APP_WCF_API_BASE_URL || '').replace(/\/$/, '');
const SERVICES_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');
const AZURE_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');

let globalFetchedCountUserId = null;
let globalFetchedBannerUserId = null;
let globalFetchedGlobalUpdatesUserId = null;

const Header = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, toggleSidebarLock, sidebarLocked, onAddClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const localData = React.useMemo(() => ({
    companyName: localStorage.getItem('CompanyName') || localStorage.getItem('DisplayName') || '',
    partnerLogo: localStorage.getItem('Logo') || 'https://docs.kit19.com/assets/custom/partner/resource/10043/logobig.PNG',
    faviconIcon: localStorage.getItem('FaviconIcon') || '',
    displayName: localStorage.getItem('DisplayName') || 'User'
  }), []);

  const { userId, TokenId, LoginName, FName, LName } = getSession();
  const navigationContext = useNavigationContext();
  const pageCode = navigationContext?.currentPageCode || "";

  const pageName = React.useMemo(() => findPageName(navigationContext?.navigation, location.pathname) || pageCode, [navigationContext?.navigation, location.pathname, pageCode]);

  useEffect(() => {
    let titlePrefix = localData.companyName || 'Kit19Sales';
    if (pageName && LoginName) {
        titlePrefix = `${pageName} | ${LoginName}`;
    } else if (LoginName) {
        titlePrefix = `${titlePrefix} | ${LoginName}`;
    }
    
    document.title = titlePrefix;

    if (localData.faviconIcon) {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = localData.faviconIcon;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [localData.companyName, localData.faviconIcon, pageName, LoginName]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [updatesData, setUpdatesData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasFetchedList, setHasFetchedList] = useState(false);
  const [bannerData, setBannerData] = useState(null);

  // 1. Fetch count on load
  useEffect(() => {
    if (!userId || globalFetchedCountUserId === userId) return;
    globalFetchedCountUserId = userId;
    let mounted = true;
    const fetchCount = async () => {
      try {
        const response = await fetch(`${SERVICES_BASE}/UserCRM/GetNotificationCount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Token: "-2295521862261168",
            Details: {
              strUserID: String(userId)
            }
          })
        });
        if (!response.ok) throw new Error('API failed');
        const resp = await response.json();
        let rawCount = resp?.d ? (typeof resp.d === 'string' ? JSON.parse(resp.d) : resp.d) : (resp?.Details || resp);
        if (rawCount && rawCount.data) rawCount = rawCount.data;
        
        let c = parseInt(rawCount, 10);
        // Sometimes it returns an array of objects for count depending on backend structure, so check length or fallback
        if (Array.isArray(rawCount)) c = rawCount.length;
        if (!isNaN(c) && mounted) setUnreadCount(c);
      } catch (error) {
        console.error('fetchCount error:', error);
      }
    };
    fetchCount();
    return () => { mounted = false; };
  }, [userId]);

  // Fetch Banner
  useEffect(() => {
    if (!userId || globalFetchedBannerUserId === userId) return;
    globalFetchedBannerUserId = userId;
    let mounted = true;
    const fetchBanner = async () => {
      try {
        const endpoint = API_ENDPOINTS.COMMON.COMMON_ACTION_MODE_BASED;
        const response = await fetch(`${AZURE_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Token: "-2295521862261168",
            Details: JSON.stringify({
              Mode: "GetBanner",
              UserId: parseInt(userId, 10),
              ApplicationCode: "sales",
              ModuleCode: ""
            })
          })
        });
        if (!response.ok) throw new Error('Banner API failed');
        const resp = await response.json();
        if (resp && resp.Status === 1 && resp.Details && resp.Details.length > 0) {
          if (mounted) setBannerData(resp.Details[0]);
        }
      } catch (error) {
        console.error('fetchBanner error:', error);
      }
    };
    fetchBanner();
    return () => { mounted = false; };
  }, [userId]);

  const [globalUpdates, setGlobalUpdates] = useState([]);
  const [pageUpdates, setPageUpdates] = useState([]);


  // Fetch Global Updates (Only Once per User)
  useEffect(() => {
    if (!userId || globalFetchedGlobalUpdatesUserId === userId) return;
    globalFetchedGlobalUpdatesUserId = userId;

    let mounted = true;
    const fetchGlobal = async () => {
      try {
        const endpoint = API_ENDPOINTS.COMMON.COMMON_ACTION_MODE_BASED;
        const res = await fetch(`${AZURE_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Token: "-2295521862261168",
            Details: JSON.stringify({ Mode: "GetUpdates", UserId: parseInt(userId, 10), ApplicationCode: "SALES", ModuleCode: "" })
          })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.Status === 1 && data?.Details) {
          setGlobalUpdates(data.Details);
        }
      } catch (error) { console.error('fetchGlobalUpdates error:', error); }
    };
    fetchGlobal();
    return () => { mounted = false; };
  }, [userId]);

  const fetchedPageUpdatesRef = React.useRef(null);

  // Fetch Page-Specific Updates (Only when pageCode changes)
  useEffect(() => {
    if (!userId || !pageCode) {
      setPageUpdates([]);
      return;
    }
    const cacheKey = `${userId}-${pageCode}`;
    if (fetchedPageUpdatesRef.current === cacheKey) return;
    fetchedPageUpdatesRef.current = cacheKey;

    let mounted = true;
    const fetchPage = async () => {
      try {
        const endpoint = API_ENDPOINTS.COMMON.COMMON_ACTION_MODE_BASED;
        const res = await fetch(`${AZURE_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Token: "-2295521862261168",
            Details: JSON.stringify({ Mode: "GetUpdates", UserId: parseInt(userId, 10), ApplicationCode: "SALES", ModuleCode: pageCode })
          })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.Status === 1 && data?.Details) {
          setPageUpdates(data.Details);
        }
      } catch (error) { console.error('fetchPageUpdates error:', error); }
    };
    fetchPage();
    return () => { mounted = false; };
  }, [userId, pageCode]);

  // Merge Updates and check unread
  useEffect(() => {
    const combined = [...globalUpdates, ...pageUpdates];
    const unique = Array.from(new Map(combined.map(u => [u.UpdateId, u])).values());
    setUpdatesData(unique);
    
    const readUpdateIds = JSON.parse(localStorage.getItem('readUpdates') || '[]');
    const hasNew = unique.some(u => !readUpdateIds.includes(u.UpdateId));
    setHasUnreadUpdates(hasNew);
  }, [globalUpdates, pageUpdates]);

  // 2. Fetch full list
  const fetchNotifications = async () => {
    if (!userId || isNotifLoading) return;
    setIsNotifLoading(true);
    try {
      const response = await fetch(`${WCF_BASE}/UserCRMCampaign/Service/Notification.asmx/funcToDisplayNotification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strUserID: String(userId) })
      });
      if (!response.ok) throw new Error('API failed');
      const resp = await response.json();
      let raw = resp?.d ? (typeof resp.d === 'string' ? JSON.parse(resp.d) : resp.d) : (resp?.Details || resp);
      if (raw && raw.data) raw = raw.data;
      const arr = Array.isArray(raw) ? raw : [];
      const mapped = arr.map((it, idx) => ({
        id: it.NotificationId || it.Id || it.ID || it.id || it.NFHID || idx,
        title: it.Title || it.NotificationTitle || it.Event || it.Subject || 'Notification',
        message: it.Message || it.Description || it.Body || it.Msg || it.NotificationText || '',
        time: it.Time || it.CreatedOn || it.CreatedDate || it.Date || it.TimeStamp || '',
        isRead: (it.IsRead === 1 || it.IsRead === true || it.Read === true || String(it.IsRead) === '1') ? true : false,
        raw: it
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.isRead).length);
      setHasFetchedList(true);
    } catch (error) {
      console.error('fetchNotifications error:', error);
    } finally {
      setIsNotifLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    if (!showNotifications && !hasFetchedList) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    for (const id of unreadIds) {
      try {
        await fetch(`${WCF_BASE}/UserCRMCampaign/Service/Notification.asmx/FuncToMarkAsRead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strNFHID: String(id) })
        });
      } catch (error) { console.error('markAllAsRead error:', error); }
    }
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(`${WCF_BASE}/UserCRMCampaign/Service/Notification.asmx/FuncToMarkAsRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strNFHID: String(id) })
      });
    } catch (error) { console.error('markAsRead error:', error); }
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`${WCF_BASE}/UserCRMCampaign/Service/Notification.asmx/FuncToMarkAsDeleted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strNFHID: String(id) })
      });
    } catch (error) { console.error('deleteNotification error:', error); }
  };
  

  return (
    <header className="glass-header bg-white/70 border-b border-gray-200/50 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-[1200] backdrop-blur-md">
      <div className="flex items-center justify-between w-full relative">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Menu className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Desktop collapse/expand toggle */}
          <button
            onClick={toggleSidebarLock}
            className={clsx(
              "hidden lg:inline-flex items-center justify-center p-2 rounded-lg transition-all",
              sidebarLocked ? "text-blue-600 bg-blue-50 shadow-sm" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            )}
            title={sidebarLocked ? 'Unlock sidebar (hover mode)' : 'Lock sidebar (always open)'}
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} />
          </button>

          {/* Logo - only visible when sidebar is NOT open to avoid redundancy */}
          {!sidebarOpen && !sidebarLocked && (
            <div className="flex items-center ml-2 transition-opacity duration-300">
                <div className="relative">
                  <img 
                    src={localData.partnerLogo} 
                    alt={localData.displayName} 
                    className="h-10 object-contain"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = '/assets/custom/NewIndexPage/logobig.png'; 
                    }}
                  />
                  <span className="absolute -top-1 -right-4 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-extrabold rounded-full shadow-sm border border-white">
                    BETA
                  </span>
                </div>
            </div>
          )}
        </div>

        {/* Center section (Announcements) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-10">
          {bannerData && (
          <div className="flex items-center">
            <div className="overflow-hidden flex items-center">
               <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm flex items-center gap-3">
                 <div className="flex items-center gap-2 whitespace-nowrap">
                   <span className="relative flex h-2 w-2 shrink-0">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                   </span>
                   {bannerData.BannerDescription || bannerData.BannerTitle}
                 </div>
               </div>
            </div>
          </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6">
          {/* Agent Info */}
          <div className="hidden lg:flex items-center">
            <div className="mr-1">
              <span className="text-sm font-bold text-gray-800 flex items-center tracking-tight">
                <span className="text-blue-600">{LoginName || 'kmukesh343'}</span>
                <span className="text-gray-500 font-medium ml-1">({FName ? `${FName} ${LName}` : 'Mukesh Kumar'})</span>
              </span>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-3"></div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;

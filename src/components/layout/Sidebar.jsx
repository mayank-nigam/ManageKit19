import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiUserPlus, FiCalendar, FiPhone, FiTarget,
  FiCheckSquare, FiMapPin, FiActivity, FiStar, FiTrello, FiClock,
  FiFileText, FiDollarSign, FiCreditCard, FiBook,
  FiLogOut, FiChevronDown, FiChevronRight, FiSearch, FiSettings
} from 'react-icons/fi';
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import clsx from 'clsx';
import { THEME } from '../../config/constants';
import { IoMdSync } from "react-icons/io";
import { CopyPlus, ListFilterPlus, Merge } from 'lucide-react';
import { handleLogout } from '../../utils/logout';
import { useNavigationContext } from '../../context/NavigationContext';
import Tooltip from '@mui/material/Tooltip';

const MenuItem = ({ item, depth = 0, location, expandedMenus, toggleMenu, isOpen }) => {
  const isActive = location.pathname === item.href;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isExpanded = expandedMenus[item.name];

  const isAnyChildActive = (menuItem) => {
    if (menuItem.href && location.pathname === menuItem.href) return true;
    if (menuItem.subItems) {
      return menuItem.subItems.some(sub => isAnyChildActive(sub));
    }
    return false;
  };

  const isSubItemActive = hasSubItems && item.subItems.some(sub => isAnyChildActive(sub));
  const paddingLeft = depth === 0 ? '0.75rem' : `${0.75 + depth * 0.75}rem`;

  if (hasSubItems) {
    return (
      <div key={item.name}>
        <button
          onClick={() => toggleMenu(item.name)}
          title={item.name}
          className={clsx(
            'flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full hover-elevate',
            !isOpen && depth === 0 ? 'justify-center px-3' : '',
            isSubItemActive ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-gray-700 hover:bg-gray-100/80'
          )}
          style={{
            paddingLeft: !isOpen && depth === 0 ? undefined : paddingLeft,
            paddingRight: '0.75rem',
          }}
        >
          {item.icon && <item.icon className="w-5 h-5 shrink-0" style={{ color: isSubItemActive ? '#0ea5e9' : '#4a5568' }} />}
          {(!item.icon && depth > 0) && <span className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-400">-</span>}
          
          <span className={clsx(!isOpen ? 'hidden' : 'flex-1 text-left', isSubItemActive ? '' : 'text-gray-700')}>
            {item.name}
          </span>
          
          {isOpen && (
            isExpanded ?
              <FiChevronDown className="w-4 h-4 shrink-0" style={{ color: isSubItemActive ? '#0ea5e9' : '#4a5568' }} /> :
              <FiChevronRight className="w-4 h-4 shrink-0" style={{ color: isSubItemActive ? '#0ea5e9' : '#4a5568' }} />
          )}
        </button>
        {isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.subItems.map((subItem) => (
              <MenuItem
                key={subItem.name}
                item={subItem}
                depth={depth + 1}
                location={location}
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                isOpen={isOpen}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      key={item.name}
      to={item.href}
      title={item.name}
      className={clsx(
        'flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full hover-elevate',
        !isOpen && depth === 0 ? 'justify-center px-3' : '',
        isActive ? 'text-white bg-gradient-primary shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
      )}
      style={{
        paddingLeft: !isOpen && depth === 0 ? undefined : paddingLeft,
        paddingRight: '0.75rem',
      }}
    >
      {item.icon && <item.icon className={depth === 0 ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"} style={{ color: isActive ? '#fff' : '#4a5568' }} />}
      {(!item.icon && depth > 0) && <span className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-400">-</span>}
      <span className={clsx(!isOpen ? 'hidden' : 'inline', isActive ? 'text-white font-semibold' : 'text-gray-700')}>
        {item.name}
      </span>
    </Link>
  );
};

const Sidebar = ({ isOpen, setIsOpen, collapsed = false, setCollapsed = null, isLocked = false, onMouseEnter, onMouseLeave }) => {
  const location = useLocation();
  const navigate = useNavigate()
  const username = localStorage.getItem('FName') || 'User';
  
  const partnerLogo = localStorage.getItem('Logo') || 'https://docs.kit19.com/assets/custom/partner/resource/10043/logobig.PNG';
  const companyName = localStorage.getItem('CompanyName') || localStorage.getItem('DisplayName') || 'Sales CRM';
  
  const [expandedMenus, setExpandedMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { navigation, loadingNav } = useNavigationContext();

  const filteredNavigation = React.useMemo(() => {
    if (!searchQuery) return navigation;
    
    const query = searchQuery.toLowerCase();
    const allNavigation = navigation;

    const filterItems = (items) => {
      return items.reduce((acc, item) => {
        const itemMatch = 
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query));
        
        let filteredSub = [];
        if (item.subItems) {
          filteredSub = filterItems(item.subItems);
        }

        if (itemMatch || filteredSub.length > 0) {
          acc.push({ ...item, subItems: filteredSub.length > 0 ? filteredSub : item.subItems });
        }
        return acc;
      }, []);
    };

    return filterItems(allNavigation);
  }, [navigation, searchQuery]);

  useEffect(() => {
    const initialExpanded = {};
    const checkExpanded = (items) => {
      let isAnyActive = false;
      items.forEach(item => {
        if (item.href && location.pathname === item.href) {
          isAnyActive = true;
        }
        if (item.subItems) {
          const childActive = checkExpanded(item.subItems);
          if (childActive) {
            initialExpanded[item.name] = true;
            isAnyActive = true;
          }
        }
      });
      return isAnyActive;
    };
    checkExpanded(navigation);
    setExpandedMenus(prev => ({ ...prev, ...initialExpanded }));
  }, [location.pathname, navigation]);

  const logout = () => {
    handleLogout(navigate);
  }

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1999] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-[2000] transform transition-all duration-300 ease-in-out glass-sidebar bg-white/80 overflow-hidden',
          'lg:relative lg:translate-x-0 will-change-[width,transform]',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:w-16 lg:translate-x-0'
        )}
        style={{ boxShadow: '1px 0 0 0 #e6edf0' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex flex-col h-full">
          <div className={clsx('flex items-center justify-between h-16 px-4 bg-white', !isOpen && 'justify-center')}>
            <div className="flex items-center gap-3 mt-2">
              {isOpen && (
                <div className="relative inline-block">
                  <img
                    src={partnerLogo}
                    alt="Logo"
                    className="h-8 object-contain"
                  />
                  <span className="absolute -top-1 -right-3 px-1 py-0.5 bg-red-600 text-white text-[8px] font-extrabold rounded-full shadow-sm border border-white leading-none">
                    BETA
                  </span>
                </div>
              )}
            </div>

            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {isOpen && (
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Menu..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 bg-gray-50 hover:bg-white transition-colors"
                  style={{ borderColor: '#e2e8f0', focusRingColor: THEME.primary }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto py-4 pl-2 flex flex-col">
            <div className="space-y-1">
              {filteredNavigation.filter(item => !['Settings', 'Setting', 'Reports', 'Report', 'Help'].includes(item.name)).map((item) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  depth={0}
                  location={location}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  isOpen={isOpen}
                />
              ))}
            </div>
            
            <div className="mt-auto pt-4 space-y-1">
              {filteredNavigation.filter(item => ['Settings', 'Setting', 'Reports', 'Report', 'Help'].includes(item.name)).length > 0 && (
                <div className="border-t border-gray-200 pt-2 mr-2"></div>
              )}
              {filteredNavigation.filter(item => ['Settings', 'Setting', 'Reports', 'Report', 'Help'].includes(item.name)).map((item) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  depth={0}
                  location={location}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  isOpen={isOpen}
                />
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className={clsx('flex items-center gap-3 mb-3', !isOpen ? 'justify-center' : '')}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: THEME.primary, fontSize: '18px' }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              {isOpen && (
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111]">{username}</p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className={clsx('flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors', !isOpen ? 'justify-center' : '')}
            >
              <FiLogOut className="w-5 h-5 shrink-0" />
              {isOpen && 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

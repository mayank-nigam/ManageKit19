import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationContext } from '../../context/NavigationContext';
import Loader from '../Loader/Loader';

const globalWhiteList = [
  '/', 
  '/dashboard',
  '/login', 
  '/access-denied', 
  '/sso-callback', 
  '/callback',
  '/master-settings/entity-approval-settings',
  '/master-settings/product-search-criteria',
  '/master-settings/field-masking',
  '/report-pages/usage-report',
  '/report-pages/followup-report',
  '/report-pages/whatsapp-subscription',
  '/report-pages/email-subscription',
  '/report-pages/lead-report',
  '/report-pages/call-report',
  '/report-pages/call-detail',
  '/notifications',
  '/sales-target',
  '/roles/team-master',
  '/roles/user-role-mapping'
];

const GlobalRouteGuard = ({ children }) => {
  const { allowedRoutes, loadingNav, refetchMenu } = useNavigationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  
  const cleanPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
  const isGlobalRoute = globalWhiteList.includes(cleanPath) || 
  location.pathname.startsWith('/master-settings/product-search-criteria') ||
  location.pathname.startsWith('/master-settings/field-masking');

  // Trigger a strict API re-validation on every route change
  useEffect(() => {
    if (isGlobalRoute || loadingNav) return;

    let mounted = true;
    const validateRoute = async () => {
      setIsValidating(true);
      await refetchMenu();
      if (mounted) {
        setIsValidating(false);
      }
    };

    validateRoute();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isGlobalRoute, loadingNav]);

  // Check if the route is allowed after validation
  useEffect(() => {
    // Wait until both the initial load and the strict validation are finished
    if (loadingNav || isValidating) return;
    if (isGlobalRoute) return;

    let isAllowed = allowedRoutes.includes(location.pathname);

    if (!isAllowed) {
        if (location.pathname.startsWith('/apps/invoice') && allowedRoutes.includes('/invoices')) {
            isAllowed = true;
        }
        if (location.pathname.startsWith('/master-settings/tax-settings')) {
            isAllowed = true;
        }
        if (location.pathname.startsWith('/master-settings/payment-method')) {
            isAllowed = true;
        }
        if (location.pathname.startsWith('/credit-notes') && allowedRoutes.includes('/credit-notes')) {
            isAllowed = true;
        }
        if (location.pathname.startsWith('/quotations') && allowedRoutes.includes('/quotations')) {
            isAllowed = true;
        }
    }

    if (!isAllowed) {
      navigate('/access-denied', { replace: true });
    }
  }, [location.pathname, allowedRoutes, loadingNav, isValidating, navigate, isGlobalRoute]);

  // Prevent UI Flash: Render the custom Loader during validation
  if ((loadingNav || isValidating) && !isGlobalRoute) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default GlobalRouteGuard;

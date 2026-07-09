import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { antdTheme } from './antd-config';
import 'antd/dist/reset.css';

import { NavigationProvider } from './context/NavigationContext';
import GlobalRouteGuard from './components/common/GlobalRouteGuard';
import MainLayout from './components/layout/MainLayout';
import Providers from './components/common/Template_Layouts/Providers';
import BannerModule from './pages/banner/BannerModule';
import UpdateModule from './pages/update/UpdateModule';
import HelpModule from './pages/help/HelpModule';
import UserRole from './pages/RolesAndRights/UserRole/UserRole';
import TeamMaster from './pages/RolesAndRights/TeamMaster/TeamMaster';
import UserRoleMapping from './pages/RolesAndRights/UserRoleMapping/UserRoleMapping';

import './App.css';

import DashboardHome from './pages/DashboardHome';

const ProtectedLayout = () => (
  <NavigationProvider>
    <GlobalRouteGuard>
      <MainLayout />
    </GlobalRouteGuard>
  </NavigationProvider>
);

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <Providers>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="banner" element={<BannerModule />} />
              <Route path="updates" element={<UpdateModule />} />
              <Route path="help" element={<HelpModule />} />
              <Route path="roles/user-role" element={<UserRole />} />
              <Route path="roles/team-master" element={<TeamMaster />} />
              <Route path="roles/user-role-mapping" element={<UserRoleMapping />} />
              {/* Add more admin routes here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </Providers>
    </ConfigProvider>
  );
}

export default App;

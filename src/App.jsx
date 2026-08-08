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
import RolePermissionMapping from './pages/RolesAndRights/RolePermissionMapping/RolePermissionMapping';
import ModuleMaster from './pages/RolesAndRights/ModuleMaster/ModuleMaster';
import FieldMasking from './pages/RolesAndRights/FieldMasking/FieldMasking';
// import CollaboratorTeam from './pages/RolesAndRights/CollaboratorTeam/CollaboratorTeam';
// import CollaboratorType from './pages/RolesAndRights/CollaboratorType/CollaboratorType';

import './App.css';

import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login/Login';

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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="banner" element={<BannerModule />} />
              <Route path="updates" element={<UpdateModule />} />
              <Route path="help" element={<HelpModule />} />
              <Route path="roles/user-role" element={<UserRole />} />
              <Route path="roles/team-master" element={<TeamMaster />} />
              <Route path="roles/user-role-mapping" element={<UserRoleMapping />} />
              <Route path="roles/role-permission-mapping" element={<RolePermissionMapping />} />
              <Route path="roles/user-role-mapping" element={<UserRoleMapping />} />
              <Route path="roles/field-masking" element={<FieldMasking />} />
              <Route path="roles/module-master" element={<ModuleMaster />} />
              {/* <Route path="master-settings/collaborator-team" element={<CollaboratorTeam />} /> */}
              {/* <Route path="master-settings/collaborator-type" element={<CollaboratorType />} /> */}
              {/* Add more admin routes here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </Providers>
    </ConfigProvider>
  );
}

export default App;

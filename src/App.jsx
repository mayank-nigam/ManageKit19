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
import ManageUser from './pages/Partner/ManageUser/ManageUser';
import UserSegmentation from './pages/Partner/UserSegmentation/UserSegmentation';
import SnapshotList from './pages/Partner/Snapshots/SnapshotList';
import ChangePartnerRequest from './pages/Partner/ChangePartnerRequest/ChangePartnerRequest';
import LicenceTransaction from './pages/Partner/LicenceTransaction/LicenceTransaction';
import ImpersonationRequestReceived from './pages/Partner/ImpersonationRequest/ImpersonationRequestReceived';
import Customization from './pages/Partner/Customization/Customization';
import ReserveFund from './pages/Partner/ReserveFund/ReserveFund';
import VerifyKYC from './pages/Partner/VerifyKYC/VerifyKYC';
import BannerList from './pages/Partner/Banner/BannerList';
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
              <Route path="partner/manage-user" element={<ManageUser />} />
              <Route path="partner/user-segmentation" element={<UserSegmentation />} />
              <Route path="partner/snapshots" element={<SnapshotList />} />
              <Route path="partner/change-partner-request" element={<ChangePartnerRequest />} />
              <Route path="partner/licence-transaction" element={<LicenceTransaction />} />
              <Route path="partner/impersonation-request-received" element={<ImpersonationRequestReceived />} />
              <Route path="partner/banner" element={<BannerList />} />
              <Route path="partner/customization" element={<Customization />} />
              <Route path="partner/reserve-fund" element={<ReserveFund />} />
              <Route path="partner/verify-kyc" element={<VerifyKYC />} />
              <Route path="partner/team-role-mapping" element={<UserRoleMapping />} />
              <Route path="partner/role-master" element={<UserRole />} />
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

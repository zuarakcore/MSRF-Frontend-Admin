import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { StudentListPage } from './pages/super-admin/StudentListPage';
import { StudentProfilePage } from './pages/super-admin/StudentProfilePage';
import { CoachListPage } from './pages/super-admin/CoachListPage';
import { CoachProfilePage } from './pages/super-admin/CoachProfilePage';
import { StudentAssignmentPage } from './pages/super-admin/StudentAssignmentPage';
import { AttendanceManagementPage } from './pages/super-admin/AttendanceManagementPage';
import { FeeManagementPage } from './pages/super-admin/FeeManagementPage';
import { PaymentVerificationPage } from './pages/super-admin/PaymentVerificationPage';
import { InvoiceListPage } from './pages/super-admin/InvoiceListPage';
import { ReportsCenterPage } from './pages/super-admin/ReportsCenterPage';
import { NotificationsPage } from './pages/super-admin/NotificationsPage';
import { SettingsPage } from './pages/super-admin/SettingsPage';

// Website CMS Modules (Individual Sidebar Routes)
import { ProgrammesCMSPage } from './pages/super-admin/website/ProgrammesCMSPage';
import { TeamCMSPage } from './pages/super-admin/website/TeamCMSPage';
import { GalleryManagementPage } from './pages/super-admin/GalleryManagementPage';
import { CareersCMSPage } from './pages/super-admin/website/CareersCMSPage';
import { JobApplicationsCMSPage } from './pages/super-admin/website/JobApplicationsCMSPage';
import { ContactEnquiriesCMSPage } from './pages/super-admin/website/ContactEnquiriesCMSPage';

// Coach Pages
import { CoachDashboard } from './pages/coach/CoachDashboard';
import { CoachStudentListPage } from './pages/coach/CoachStudentListPage';
import { CoachStudentProfilePage } from './pages/coach/CoachStudentProfilePage';
import { CoachAttendancePage } from './pages/coach/CoachAttendancePage';
import { CoachPerformancePage } from './pages/coach/CoachPerformancePage';

import { UnauthorizedPage } from './pages/error/UnauthorizedPage';
import { UserRole } from './types';

// Role Guard Wrapper Component
const RoleGuard: React.FC<{ children: React.ReactNode; allowedRole: UserRole }> = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return role === 'SUPER_ADMIN' ? (
    <Navigate to="/super-admin/dashboard" replace />
  ) : (
    <Navigate to="/coach/dashboard" replace />
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Super Admin Protected Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/students"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <StudentListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/students/:id"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <StudentProfilePage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/coaches"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <CoachListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/coaches/:id"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <CoachProfilePage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/student-assignments"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <StudentAssignmentPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/attendance"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <AttendanceManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/fees"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <FeeManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/payments"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <PaymentVerificationPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/invoices"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <InvoiceListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/reports"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <ReportsCenterPage />
                </RoleGuard>
              }
            />

            {/* Website CMS Separate Routes */}
            <Route
              path="/super-admin/website/programmes"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <ProgrammesCMSPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/website/team"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <TeamCMSPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/website/gallery"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <GalleryManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/website/careers"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <CareersCMSPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/website/job-applications"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <JobApplicationsCMSPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/website/enquiries"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <ContactEnquiriesCMSPage />
                </RoleGuard>
              }
            />

            <Route
              path="/super-admin/notifications"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <NotificationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/super-admin/settings"
              element={
                <RoleGuard allowedRole="SUPER_ADMIN">
                  <SettingsPage />
                </RoleGuard>
              }
            />

            {/* Coach Portal Protected Routes */}
            <Route
              path="/coach/dashboard"
              element={
                <RoleGuard allowedRole="COACH">
                  <CoachDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/coach/students"
              element={
                <RoleGuard allowedRole="COACH">
                  <CoachStudentListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coach/students/:id"
              element={
                <RoleGuard allowedRole="COACH">
                  <CoachStudentProfilePage />
                </RoleGuard>
              }
            />
            <Route
              path="/coach/attendance"
              element={
                <RoleGuard allowedRole="COACH">
                  <CoachAttendancePage />
                </RoleGuard>
              }
            />
            <Route
              path="/coach/performance"
              element={
                <RoleGuard allowedRole="COACH">
                  <CoachPerformancePage />
                </RoleGuard>
              }
            />

            {/* Error & Unauthorized Boundary */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

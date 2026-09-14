import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Login } from './components/auth/Login';
import { AdminPanel } from './components/admin/AdminPanel';
import { VendorRegistrationView } from './components/vendor/VendorRegistrationView';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { CustomerView } from './components/customer/CustomerView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const AppLayout = () => (
  <AuthProvider>
    <AppProvider>
      <Outlet />
    </AppProvider>
  </AuthProvider>
);

import { Outlet } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: '/vendor/register',
        element: <VendorRegistrationView />,
      },
      {
        path: '/vendor/:vendorSlug/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'vendor']}>
            <VendorDashboard initialTab="overview" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/vendor/:vendorSlug/kds',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'vendor']}>
            <VendorDashboard initialTab="kds" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/:vendorSlug',
        element: <CustomerView />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

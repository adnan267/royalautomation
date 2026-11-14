import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/Feedback';
import { ToastProvider, ConfirmProvider } from './components/ui';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Submissions = lazy(() => import('./pages/Submissions'));
const ResourceManager = lazy(() => import('./pages/ResourceManager'));
const Media = lazy(() => import('./pages/Media'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Account = lazy(() => import('./pages/Account'));
const GalleryAdmin = lazy(() => import('./pages/GalleryAdmin'));

function Protected({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <PageLoader label="Checking session…" />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<Protected><AdminLayout /></Protected>}>
              <Route index element={<Dashboard />} />
              <Route path="quotes" element={<Submissions kind="quotes" />} />
              <Route path="inquiries" element={<Submissions kind="inquiries" />} />
              <Route path="services" element={<ResourceManager kind="services" />} />
              <Route path="industries" element={<ResourceManager kind="industries" />} />
              <Route path="products" element={<ResourceManager kind="products" />} />
              <Route path="projects" element={<ResourceManager kind="projects" />} />
              <Route path="brands" element={<ResourceManager kind="brands" />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="media" element={<Media />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="account" element={<Account />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ConfirmProvider>
    </ToastProvider>
  );
}

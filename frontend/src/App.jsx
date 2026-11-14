import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { MotionConfig } from 'framer-motion';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { PageLoader } from './components/ui/Feedback';

const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Industries = lazy(() => import('./pages/Industries'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Quote = lazy(() => import('./pages/Quote'));
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <AuthProvider>
                <Suspense fallback={<PageLoader label="Loading admin…" />}>
                  <AdminApp />
                </Suspense>
              </AuthProvider>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="industries" element={<Industries />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="request-a-quote" element={<Quote />} />
            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="terms-and-conditions" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SiteProvider>
    </MotionConfig>
  );
}

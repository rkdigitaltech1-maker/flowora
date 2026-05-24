import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import MetaCallback from "./pages/auth/MetaCallback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DashboardLayout from "./pages/dashboard/layout.tsx";
import DashboardOverview from "./pages/dashboard/page.tsx";
import SettingsPage from "./pages/dashboard/settings/page.tsx";
import OrdersPage from "./pages/dashboard/orders/page.tsx";

import AdminLayout from "./pages/admin/layout.tsx";
import AdminDashboard from "./pages/admin/page.tsx";
import AdminCreatorsPage from "./pages/admin/creators/page.tsx";
import AdminFlaggedAccountsPage from "./pages/admin/flagged/page.tsx";
import AdminProductsPage from "./pages/admin/products/page.tsx";
import AdminCampaignsPage from "./pages/admin/campaigns/page.tsx";
import AdminSupportPage from "./pages/admin/support/page.tsx";
import AdminSettingsPage from "./pages/admin/settings/page.tsx";
import AdminLoginPage from "./pages/admin/login.tsx";
import AdminAuthProvider from "./components/providers/admin-auth-provider.tsx";
import LoginPage from "./pages/login.tsx";
import OnboardingPage from "./pages/onboarding/page.tsx";
import AboutPage from "./pages/about.tsx";
import CareersPage from "./pages/careers.tsx";
import BlogPage from "./pages/blog.tsx";
import SupportPage from "./pages/support.tsx";
import SafetyPage from "./pages/safety.tsx";
import PrivacyPage from "./pages/privacy.tsx";
import TermsPage from "./pages/terms.tsx";
import GdprPage from "./pages/gdpr.tsx";

// Creator Dashboard pages
import WorkflowsPage from "./pages/dashboard/workflows/page.tsx";
import WorkflowBuilderPage from "./pages/dashboard/workflows/builder.tsx";
import CampaignsPage from "./pages/dashboard/campaigns/page.tsx";
import LeadsPage from "./pages/dashboard/leads/page.tsx";
import ProductsPage from "./pages/dashboard/products/page.tsx";
import AutomationHealthPage from "./pages/dashboard/automation-health/page.tsx";
import LearnPage from "./pages/dashboard/learn/page.tsx";
import ReferPage from "./pages/dashboard/refer/page.tsx";
import CheckoutPage from "./pages/dashboard/checkout/page.tsx";
import StripePlayground from "./pages/dashboard/stripe-playground.tsx";


export default function App() {
  return (
    <DefaultProviders>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/gdpr" element={<GdprPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/meta/callback" element={<MetaCallback />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Admin Login (outside admin layout) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="orders" element={<OrdersPage />} />

              {/* Creator Dashboard Routes */}
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/:workflowId" element={<WorkflowBuilderPage />} />
              <Route path="automations" element={<AutomationHealthPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="contacts" element={<LeadsPage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="refer" element={<ReferPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="stripe-playground" element={<StripePlayground />} />

            </Route>

            {/* Admin Panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="creators" element={<AdminCreatorsPage />} />
              <Route path="flagged" element={<AdminFlaggedAccountsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="campaigns" element={<AdminCampaignsPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </DefaultProviders>
  );
}

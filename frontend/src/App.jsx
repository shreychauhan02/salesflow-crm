// ============================================
// SalesFlow CRM - App Router
// ============================================
// Defines all application routes:
// - Public routes: /login, /register
// - Protected routes: /dashboard, /leads, /opportunities, /reports
// - DashboardLayout wraps all protected pages with Sidebar + Navbar
//
// INTERVIEW TIP:
// "I used React Router's nested routes with a layout component.
// DashboardLayout renders the Sidebar and Navbar once, and the
// Outlet component renders the active page inside that layout.
// This avoids repeating the layout code on every page."

import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* === Protected Routes (wrapped in DashboardLayout) === */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/create" element={<CreateLeadPage />} />
        <Route path="leads/:leadId" element={<LeadDetailPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* === Catch-all: redirect unknown paths to dashboard === */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

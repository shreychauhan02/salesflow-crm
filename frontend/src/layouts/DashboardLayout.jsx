// ============================================
// SalesFlow CRM - Dashboard Layout
// ============================================
// This wraps all authenticated pages with:
// - Sidebar on the left
// - Navbar at the top
// - Main content area in the center
//
// INTERVIEW TIP:
// "I used a layout component with React Router's
// Outlet to avoid repeating the sidebar and navbar
// on every page. This follows the DRY principle."

import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Map routes to page titles
const pageTitles = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/leads/create": "Create Lead",
  "/opportunities": "Opportunities",
  "/reports": "Reports",
};

const DashboardLayout = () => {
  const location = useLocation();

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Get the page title based on current route
  const getTitle = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    // Check for lead detail/edit pages
    if (location.pathname.startsWith("/leads/")) {
      return "Lead Details";
    }
    return "SalesFlow CRM";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <Navbar title={getTitle()} />

        {/* Page Content - Outlet renders the child route's component */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

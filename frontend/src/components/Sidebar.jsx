// ============================================
// SalesFlow CRM - Sidebar Component
// ============================================
// Left sidebar navigation with links to all pages.
// Highlights the currently active page.
//
// INTERVIEW TIP:
// "I used React Router's useLocation hook to
// highlight the active navigation item, giving
// users visual feedback about which page they're on."

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation menu items
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/leads", label: "Leads", icon: "📋" },
    { path: "/opportunities", label: "Opportunities", icon: "💰" },
    { path: "/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">
          <span className="text-blue-600">Sales</span>Flow
        </h1>
        <p className="text-xs text-gray-400 mt-1">CRM Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

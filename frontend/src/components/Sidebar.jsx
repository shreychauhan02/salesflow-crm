import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, TrendingUp, BarChart3, LogOut } from "lucide-react";
import logoIcon from "../assets/logo-icon.svg";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/leads", label: "Leads", icon: <Users size={20} /> },
    { path: "/opportunities", label: "Opportunities", icon: <TrendingUp size={20} /> },
    { path: "/reports", label: "Reports", icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="SalesFlow" className="w-9 h-9" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              <span className="text-blue-600">Sales</span>Flow
            </h1>
            <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wide uppercase">CRM Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

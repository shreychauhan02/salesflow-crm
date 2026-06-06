// ============================================
// SalesFlow CRM - Navbar Component
// ============================================
// Top navigation bar showing the page title
// and current user info.
//
// Props:
//   title - The title of the current page (e.g., "Dashboard")

import { useState } from "react";

const Navbar = ({ title }) => {
  // Get user info from localStorage on initial render
  const getUserName = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.full_name || "User";
      } catch {
        return "User";
      }
    }
    return "User";
  };

  const [userName] = useState(getUserName);

  // Get initials for the profile circle (e.g., "John Doe" → "JD")
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{userName}</span>

          {/* Profile Circle with Initials */}
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{getInitials(userName)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

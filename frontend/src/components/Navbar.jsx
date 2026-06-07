import { useState } from "react";

const Navbar = ({ title }) => {
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <p className="text-[11px] text-gray-400 -mt-0.5">Admin</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm shadow-blue-200">
            <span className="text-white text-xs font-bold">{getInitials(userName)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

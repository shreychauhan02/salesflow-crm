// ============================================
// SalesFlow CRM - Stat Card Component
// ============================================
// A reusable card that shows a metric with an icon.
// Used on the Dashboard and Reports pages.
//
// Props:
//   title  - Label text (e.g., "Total Leads")
//   value  - The number to display (e.g., 42)
//   icon   - Emoji or icon string (e.g., "📋")
//   color  - Tailwind bg color class (e.g., "bg-blue-50")

const StatCard = ({ title, value, icon, color = "bg-blue-50" }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Value */}
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>

        {/* Right side - Icon Circle */}
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

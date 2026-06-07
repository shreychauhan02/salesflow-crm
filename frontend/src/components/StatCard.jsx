const StatCard = ({ title, value, icon, color = "bg-blue-50", trend, trendUp }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-300 group relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2.5 flex items-center gap-1 ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
              <span className="text-sm">{trendUp ? "\u2191" : "\u2193"}</span>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

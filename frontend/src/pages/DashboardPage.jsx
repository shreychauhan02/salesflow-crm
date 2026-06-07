import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, CheckCircle, TrendingUp, Award, Clock, BarChart3 } from "lucide-react";
import StatCard from "../components/StatCard";
import LeadTable from "../components/LeadTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeads } from "../services/leadService";
import { getOpportunities } from "../services/opportunityService";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
const SOFT_COLORS = ["#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa"];

const DashboardPage = () => {
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserName = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.full_name?.split(" ")[0] || "there";
    } catch {
      return "there";
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsData, oppsData] = await Promise.all([
        getLeads(),
        getOpportunities(),
      ]);
      setLeads(leadsData);
      setOpportunities(oppsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "Qualified").length;
  const totalOpportunities = opportunities.length;
  const wonDeals = opportunities.filter((o) => o.stage === "Won").length;

  const leadStatusCounts = ["New", "Contacted", "Qualified", "Lost", "Converted"].map((status) => ({
    name: status,
    count: leads.filter((l) => l.status === status).length,
  }));

  const oppStageCounts = ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"]
    .map((stage) => ({
      name: stage,
      value: opportunities.filter((o) => o.stage === stage).length,
    }))
    .filter((item) => item.value > 0);

  const recentLeads = leads.slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-7 text-white relative overflow-hidden shadow-[0_4px_20px_rgba(37,99,235,0.25)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold mb-1 tracking-tight">{getGreeting()}, {getUserName()}!</h1>
          <p className="text-blue-100 text-sm font-medium">
            Here's what's happening with your sales pipeline today.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={<Users size={22} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Qualified Leads"
          value={qualifiedLeads}
          icon={<CheckCircle size={22} className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Total Opportunities"
          value={totalOpportunities}
          icon={<TrendingUp size={22} className="text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Won Deals"
          value={wonDeals}
          icon={<Award size={22} className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Leads by Status</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Distribution across pipeline stages</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner shadow-blue-100/50">
              <BarChart3 size={16} className="text-blue-600" />
            </div>
          </div>
          {leads.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={leadStatusCounts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Plus Jakarta Sans" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Plus Jakarta Sans" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12 text-sm">No lead data to display</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Opportunities by Stage</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Current deal pipeline breakdown</p>
            </div>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shadow-inner shadow-amber-100/50">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
          </div>
          {oppStageCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={oppStageCounts}
                  cx="50%"
                  cy="48%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                >
                  {oppStageCounts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06))" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: "12px",
                    padding: "10px 14px",
                  }}
                  formatter={(value, name) => [`${value} deals`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12 text-sm">No opportunity data to display</p>
          )}
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Recent Leads</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{recentLeads.length} of {totalLeads} leads shown</p>
            </div>
            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shadow-inner shadow-gray-100/50">
              <Clock size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="p-0">
          <LeadTable leads={recentLeads} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

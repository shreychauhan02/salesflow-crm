// ============================================
// SalesFlow CRM - Dashboard Page
// ============================================
// Main dashboard showing summary cards, recent leads table,
// and two simple charts (Leads by Status, Opportunities by Stage).
//
// INTERVIEW TIP:
// "The dashboard fetches data from two API endpoints on mount
// using useEffect. I calculate summary stats on the frontend
// by filtering the arrays, keeping the backend simple."

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import StatCard from "../components/StatCard";
import LeadTable from "../components/LeadTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeads } from "../services/leadService";
import { getOpportunities } from "../services/opportunityService";

// Colors for the pie chart slices
const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const DashboardPage = () => {
  // Data state
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch leads and opportunities in parallel
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

  // Fetch data when page loads
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Calculate Summary Stats ---
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === "Qualified").length;
  const totalOpportunities = opportunities.length;
  const wonDeals = opportunities.filter((o) => o.stage === "Won").length;

  // --- Prepare Chart Data ---
  // Leads by Status (for bar chart)
  const leadStatusCounts = ["New", "Contacted", "Qualified", "Lost", "Converted"].map((status) => ({
    name: status,
    count: leads.filter((l) => l.status === status).length,
  }));

  // Opportunities by Stage (for pie chart)
  const oppStageCounts = ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"]
    .map((stage) => ({
      name: stage,
      value: opportunities.filter((o) => o.stage === stage).length,
    }))
    .filter((item) => item.value > 0); // Remove empty slices

  // Get only the 5 most recent leads for the table
  const recentLeads = leads.slice(0, 5);

  // Show spinner while loading
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={totalLeads} icon="📋" color="bg-blue-50" />
        <StatCard title="Qualified Leads" value={qualifiedLeads} icon="✅" color="bg-green-50" />
        <StatCard title="Total Opportunities" value={totalOpportunities} icon="💰" color="bg-amber-50" />
        <StatCard title="Won Deals" value={wonDeals} icon="🏆" color="bg-purple-50" />
      </div>

      {/* --- Charts Row --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Leads by Status (Bar Chart) */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leads by Status</h3>
          {leads.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadStatusCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No lead data to display</p>
          )}
        </div>

        {/* Chart 2: Opportunities by Stage (Pie Chart) */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Opportunities by Stage</h3>
          {oppStageCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={oppStageCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {oppStageCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No opportunity data to display</p>
          )}
        </div>
      </div>

      {/* --- Recent Leads Table --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Leads</h3>
        <LeadTable leads={recentLeads} />
      </div>
    </div>
  );
};

export default DashboardPage;

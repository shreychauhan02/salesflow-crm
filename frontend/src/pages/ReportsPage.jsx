// ============================================
// SalesFlow CRM - Reports Page
// ============================================
// Shows summary stats and a simple revenue table.
//
// INTERVIEW TIP:
// "The reports page calculates all metrics on the frontend
// by processing the opportunities array. For a production app,
// you'd create dedicated report endpoints on the backend
// for better performance with large datasets."

import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeads } from "../services/leadService";
import { getOpportunities } from "../services/opportunityService";

// Format number as Indian currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const ReportsPage = () => {
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all report data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, oppsData] = await Promise.all([
        getLeads(),
        getOpportunities(),
      ]);
      setLeads(leadsData);
      setOpportunities(oppsData);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Calculate Report Metrics ---
  // Total revenue = sum of deal values for "Won" deals
  const wonDeals = opportunities.filter((o) => o.stage === "Won");
  const totalRevenue = wonDeals.reduce((sum, o) => sum + o.deal_value, 0);

  // Lost deals
  const lostDeals = opportunities.filter((o) => o.stage === "Lost");

  // Conversion rate = (Converted leads / Total leads) * 100
  const convertedLeads = leads.filter((l) => l.status === "Converted").length;
  const conversionRate = leads.length > 0
    ? ((convertedLeads / leads.length) * 100).toFixed(1)
    : "0.0";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon="💰"
          color="bg-green-50"
        />
        <StatCard
          title="Won Deals"
          value={wonDeals.length}
          icon="🏆"
          color="bg-blue-50"
        />
        <StatCard
          title="Lost Deals"
          value={lostDeals.length}
          icon="📉"
          color="bg-red-50"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon="📊"
          color="bg-purple-50"
        />
      </div>

      {/* --- Revenue Table --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Details</h3>

        {wonDeals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Opportunity</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Deal Value</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Stage</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Approval</th>
                </tr>
              </thead>
              <tbody>
                {wonDeals.map((opp) => (
                  <tr key={opp.id} className="border-b border-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{opp.opportunity_name}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      {formatCurrency(opp.deal_value)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium badge-won">
                        Won
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium badge-${opp.approval_status.toLowerCase()}`}>
                        {opp.approval_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">📊</p>
            <p>No won deals yet. Convert and close deals to see revenue data.</p>
          </div>
        )}
      </div>

      {/* --- All Opportunities Summary --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Prospecting", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => {
            const count = opportunities.filter((o) => o.stage === stage).length;
            const value = opportunities
              .filter((o) => o.stage === stage)
              .reduce((sum, o) => sum + o.deal_value, 0);
            return (
              <div key={stage} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{stage}</p>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-400 mt-1">{formatCurrency(value)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

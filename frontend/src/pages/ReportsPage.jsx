import { useState, useEffect } from "react";
import { DollarSign, Trophy, TrendingDown, Percent } from "lucide-react";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeads } from "../services/leadService";
import { getOpportunities } from "../services/opportunityService";

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

  const wonDeals = opportunities.filter((o) => o.stage === "Won");
  const totalRevenue = wonDeals.reduce((sum, o) => sum + o.deal_value, 0);
  const lostDeals = opportunities.filter((o) => o.stage === "Lost");
  const convertedLeads = leads.filter((l) => l.status === "Converted").length;
  const conversionRate = leads.length > 0
    ? ((convertedLeads / leads.length) * 100).toFixed(1)
    : "0.0";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={24} className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Won Deals"
          value={wonDeals.length}
          icon={<Trophy size={24} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Lost Deals"
          value={lostDeals.length}
          icon={<TrendingDown size={24} className="text-red-600" />}
          color="bg-red-50"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<Percent size={24} className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Revenue Table */}
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
            <DollarSign size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No won deals yet</p>
            <p className="text-xs text-gray-400 mt-1">Convert and close deals to see revenue data</p>
          </div>
        )}
      </div>

      {/* Pipeline Summary */}
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
                <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
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

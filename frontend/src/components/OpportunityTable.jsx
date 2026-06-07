import { DollarSign } from "lucide-react";

const getStageBadge = (stage) => {
  const badges = {
    Prospecting: "badge-prospecting",
    Proposal: "badge-proposal",
    Negotiation: "badge-negotiation",
    Won: "badge-won",
    Lost: "badge-lost",
  };
  return badges[stage] || "badge-prospecting";
};

const getApprovalBadge = (status) => {
  const badges = {
    Pending: "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return badges[status] || "badge-pending";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const OpportunityTable = ({ opportunities, onDelete, onApprove }) => {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <DollarSign size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No opportunities found</p>
        <p className="text-xs text-gray-400 mt-1">Convert a lead to create an opportunity</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Opportunity</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Deal Value</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Stage</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Approval</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr key={opp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-800">{opp.opportunity_name}</td>
              <td className="py-3 px-4 text-gray-700 font-semibold">
                {formatCurrency(opp.deal_value)}
              </td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageBadge(opp.stage)}`}>
                  {opp.stage}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApprovalBadge(opp.approval_status)}`}>
                  {opp.approval_status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {opp.approval_status === "Pending" && (
                    <>
                      <button
                        onClick={() => onApprove && onApprove(opp.id, "Approved")}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onApprove && onApprove(opp.id, "Rejected")}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete && onDelete(opp.id)}
                    className="text-gray-400 hover:text-red-500 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpportunityTable;

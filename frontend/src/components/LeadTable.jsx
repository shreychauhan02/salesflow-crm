// ============================================
// SalesFlow CRM - Lead Table Component
// ============================================
// A reusable table to display leads.
// Used on the Dashboard (recent leads) and Leads page.
//
// Props:
//   leads      - Array of lead objects
//   showActions - Whether to show View/Edit/Delete buttons
//   onDelete   - Function to call when Delete is clicked
//   onEdit     - Function to call when Edit is clicked

import { useNavigate } from "react-router-dom";

// Helper function to get the right badge class for lead status
const getStatusBadge = (status) => {
  const badges = {
    New: "badge-new",
    Contacted: "badge-contacted",
    Qualified: "badge-qualified",
    Lost: "badge-lost",
    Converted: "badge-converted",
  };
  return badges[status] || "badge-new";
};

const LeadTable = ({ leads, showActions = false, onDelete, onEdit }) => {
  const navigate = useNavigate();

  // If no leads, show empty state
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-4xl mb-2">📋</p>
        <p>No leads found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
            {showActions && (
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {/* Lead Name */}
              <td className="py-3 px-4 font-medium text-gray-800">{lead.name}</td>

              {/* Company */}
              <td className="py-3 px-4 text-gray-600">{lead.company || "—"}</td>

              {/* Email */}
              <td className="py-3 px-4 text-gray-600">{lead.email}</td>

              {/* Status Badge */}
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.status)}`}>
                  {lead.status}
                </span>
              </td>

              {/* Action Buttons (optional) */}
              {showActions && (
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(lead)}
                      className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(lead.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;

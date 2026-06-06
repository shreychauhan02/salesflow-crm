// ============================================
// SalesFlow CRM - Lead Detail / Edit Page
// ============================================
// Shows a single lead's details with an edit form.
// Also allows lead conversion to opportunity.
//
// INTERVIEW TIP:
// "This page fetches a single lead by ID from the URL params.
// I used useParams() from React Router to get the dynamic
// :leadId from the URL, then pass it to the API call."

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeadById, updateLead, convertLead } from "../services/leadService";

const LeadDetailPage = () => {
  const { leadId } = useParams(); // Get lead ID from URL
  const navigate = useNavigate();

  // Lead data
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Conversion state
  const [showConvert, setShowConvert] = useState(false);
  const [convertForm, setConvertForm] = useState({
    opportunity_name: "",
    deal_value: "",
    expected_close_date: "",
  });

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch lead by ID from API
  const fetchLead = async () => {
    try {
      setLoading(true);
      const data = await getLeadById(leadId);
      setLead(data);
      setEditForm({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        source: data.source || "",
        status: data.status,
      });
    } catch (error) {
      console.error("Failed to fetch lead:", error);
      setError("Lead not found");
    } finally {
      setLoading(false);
    }
  };

  // Fetch lead on page load
  useEffect(() => {
    fetchLead();
  }, [leadId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Save edits
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const updated = await updateLead(leadId, editForm);
      setLead(updated);
      setIsEditing(false);
      setSuccess("Lead updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  // Handle lead conversion
  const handleConvert = async (e) => {
    e.preventDefault();
    setError("");

    if (!convertForm.opportunity_name || !convertForm.deal_value) {
      setError("Opportunity name and deal value are required");
      return;
    }

    try {
      setSaving(true);
      const result = await convertLead(leadId, {
        opportunity_name: convertForm.opportunity_name,
        deal_value: parseFloat(convertForm.deal_value),
        expected_close_date: convertForm.expected_close_date || undefined,
      });
      setSuccess(
        `Lead converted! Opportunity "${result.opportunity_name}" created. Approval: ${result.approval_status}`
      );
      setShowConvert(false);
      fetchLead(); // Refresh lead data
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to convert lead");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lead) return <p className="text-gray-500">Lead not found</p>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {/* Lead Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{lead.name}</h2>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                Edit
              </button>
            )}
            {lead.status === "Qualified" && (
              <button
                onClick={() => setShowConvert(!showConvert)}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                Convert to Opportunity
              </button>
            )}
          </div>
        </div>

        {/* Display Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-gray-800 font-medium">{lead.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Phone</p>
              <p className="text-gray-800 font-medium">{lead.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Company</p>
              <p className="text-gray-800 font-medium">{lead.company || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Source</p>
              <p className="text-gray-800 font-medium">{lead.source || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-gray-800 font-medium">{lead.status}</p>
            </div>
            <div>
              <p className="text-gray-400">Created</p>
              <p className="text-gray-800 font-medium">
                {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Company</label>
                <input
                  name="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Source</label>
                <input
                  name="source"
                  value={editForm.source}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Convert to Opportunity Form */}
      {showConvert && (
        <div className="bg-white rounded-xl border border-green-200 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Convert Lead to Opportunity
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This will create a new opportunity and mark the lead as "Converted".
            {" "}Deals over ₹1,00,000 will require manager approval.
          </p>
          <form onSubmit={handleConvert} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Opportunity Name *</label>
              <input
                type="text"
                value={convertForm.opportunity_name}
                onChange={(e) => setConvertForm({ ...convertForm, opportunity_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., Acme Corp - Enterprise Plan"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Deal Value (₹) *</label>
              <input
                type="number"
                value={convertForm.deal_value}
                onChange={(e) => setConvertForm({ ...convertForm, deal_value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., 150000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Expected Close Date</label>
              <input
                type="date"
                value={convertForm.expected_close_date}
                onChange={(e) => setConvertForm({ ...convertForm, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Converting..." : "Convert Lead"}
              </button>
              <button
                type="button"
                onClick={() => setShowConvert(false)}
                className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/leads")}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Leads
      </button>
    </div>
  );
};

export default LeadDetailPage;

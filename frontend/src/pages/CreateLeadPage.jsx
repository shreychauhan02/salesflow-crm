// ============================================
// SalesFlow CRM - Create Lead Page
// ============================================
// Form to create a new lead with validation.
//
// INTERVIEW TIP:
// "This form uses controlled inputs (useState for each field).
// On submit, it sends a POST request to /leads.
// The backend validates the data with Pydantic schemas
// and returns the created lead object."

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLead } from "../services/leadService";

const CreateLeadPage = () => {
  const navigate = useNavigate();

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  // This single function handles all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email) {
      setError("Name and Email are required");
      setLoading(false);
      return;
    }

    try {
      await createLead(formData);
      setSuccess("Lead created successfully!");

      // Clear form
      setFormData({ name: "", email: "", phone: "", company: "", source: "" });

      // Redirect to leads page after 1.5 seconds
      setTimeout(() => navigate("/leads"), 1500);
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to create lead. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Lead</h2>
        <p className="text-gray-500 text-sm mt-1">Add a new potential customer to your CRM</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="Rahul Sharma"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="rahul@company.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="+91-9876543210"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              placeholder="Acme Corporation"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="">Select source...</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadPage;

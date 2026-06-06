// ============================================
// SalesFlow CRM - Loading Spinner Component
// ============================================
// A simple spinning loader shown while data is being fetched.
//
// INTERVIEW TIP:
// "I created a reusable LoadingSpinner component so I can
// show a consistent loading state across all pages."

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-20">
      {/* Spinning circle animation using Tailwind */}
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-500 text-sm">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

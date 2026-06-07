const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-b-blue-300 rounded-full animate-spin" style={{ animationDuration: "1.5s" }} />
      </div>
      <span className="mt-4 text-gray-400 text-sm font-medium">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

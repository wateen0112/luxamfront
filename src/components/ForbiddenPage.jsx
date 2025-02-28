// components/ForbiddenPage.jsx
import React from "react";

const ForbiddenPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
    <h1 className="text-6xl font-bold text-red-500">403</h1>
    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-4">
      Access Denied
    </h2>
    <p className="text-lg text-gray-600 mt-2">
      You don’t have permission to access this page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="mt-6 px-6 py-2 bg-[#17a3d7] text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Retry
    </button>
  </div>
);

export default ForbiddenPage;
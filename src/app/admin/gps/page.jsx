"use client";

import React from "react";

// Main rendering function
const renderGPSPage = (setPage = null) => {
  const handleIframeClick = () => {
    window.open("https://gps.yslootahtech.com", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-5 flex flex-col items-start space-y-4 w-full h-screen">
      <div className="w-full h-full relative">
        <p className="text-xl sm:text-2xl w-full text-left font-bold text-[#17a3d7]">
          GPS
        </p>
        <div className="mt-8 w-full h-full relative">
          <iframe
            className="w-full h-full border-none"
            src="https://gps.yslootahtech.com"
            title="GPS"
            allowFullScreen
          ></iframe>
          <div
            className="absolute inset-0"
            onClick={handleIframeClick}
            style={{ cursor: "pointer" }}
            title="Click to open in new tab"
          ></div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to trigger rendering
const Page = () => {
  const [pageContent, setPageContent] = React.useState(null);

  const setPage = (content) => {
    setPageContent(content);
  };

  if (!pageContent) {
    setPage(renderGPSPage());
  }

  return pageContent;
};

export default Page;
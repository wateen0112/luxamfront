"use client";

import React from "react";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";

const convertCurrency = (aedValue) => {
  const exchangeRates = {
    USD: 0.2723, // 1 AED = 0.2723 USD
    EUR: 0.2510, // 1 AED = 0.2510 EUR
    AED: 1,      // 1 AED = 1 AED (no conversion)
  };

  const currentCurrency = Cookies.get("currency") || "AED";
  const convertedValue = aedValue && !isNaN(aedValue)
    ? (aedValue * exchangeRates[currentCurrency]).toFixed(2)
    : 0;

  return {
    convertedValue,
    currentCurrency,
  };
};

// Main function to handle all logic and rendering
const renderSearchResults = (setPage = null) => {
  let tablesData = {};

  // Fetch data from localStorage
  const data = localStorage.getItem("searchResults");
  if (data) {
    tablesData = JSON.parse(data);
  }

  // Process price fields to show only current currency
  Object.keys(tablesData).forEach((key) => {
    if (tablesData[key] && Array.isArray(tablesData[key])) {
      tablesData[key] = tablesData[key].map((item) => {
        if (item.price) {
          const { convertedValue, currentCurrency } = convertCurrency(item.price);
          return { ...item, price: `${convertedValue} ${currentCurrency}` };
        }
        return item;
      });
    }
  });

  const columnDefinitions = {
    instant_collections: [
      { key: "company_name", label: "Company" },
      { key: "public_id", label: "Public Id" },
      { key: "branch_name", label: "Branch" },
      { key: "payment_type", label: "Payment Type" },
      { key: "vehicle_number", label: "Vehicle" },
      { key: "driver_name", label: "Driver" },
      { key: "customer_name", label: "Customer Name" },
      { key: "quantity", label: "Quantity" },
      { key: "price", label: "Price" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "collected_at", label: "Collected At", type: "date" },
      { key: "action", label: "Action" },
    ],
    oil_collections: [
      { key: "public_id", label: "Public Id" },
      { key: "driver_name", label: "Driver" },
      { key: "vehicle_number", label: "Vehicle" },
      { key: "day", label: "Day" },
      { key: "company_name", label: "Company" },
      { key: "branch_name", label: "Branch" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "status", label: "Status" },
      { key: "collected_liters", label: "Collected Liters" },
      { key: "price", label: "Price" },
      { key: "action", label: "Action" },
    ],
    requests: [
      { key: "name", label: "User Name" },
      { key: "phone_number", label: "User Phone" },
      { key: "public_id", label: "Public Id" },
      { key: "status", label: "Status" },
      { key: "address", label: "Address" },
      { key: "quantity", label: "Quantity" },
      { key: "collected_at", label: "Collected At", type: "date" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "show", label: "Action" },
    ],
  };

  const tableViews = {
    instant_collections: "instantCollections",
    oil_collections: "oilCollectionScheduling",
    requests: "requests",
  };

  // Check if all data is empty
  const isEmpty = Object.values(tablesData).every((data) => data?.length === 0);

  // Render JSX
  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar flex flex-col items-center justify-center">
      <p className="text-xl sm:text-2xl font-bold text-[#17a3d7] self-start">
        Search Results
      </p>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-gray-500 text-lg sm:text-xl font-semibold">
            No data available
          </p>
        </div>
      ) : (
        Object.entries(tablesData).map(
          ([key, data]) =>
            data?.length > 0 && (
              <div key={key} className="mt-6 w-full">
                <p className="text-lg font-semibold text-gray-700 capitalize">
                  {key.replace("_", " ")}
                </p>
                <Table
                  data={{ data }}
                  columns={columnDefinitions[key]}
                  view={tableViews[key]}
                />
              </div>
            )
        )
      )}
    </div>
  );
};

// Wrapper component to trigger the initial render
const Page = () => {
  const [pageContent, setPageContent] = React.useState(null);

  const setPage = (content) => {
    setPageContent(content);
  };

  // Initial render
  if (!pageContent) {
    setPage(renderSearchResults());
  }

  return pageContent;
};

export default Page;
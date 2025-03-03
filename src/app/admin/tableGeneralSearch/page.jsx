"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";

const Page = () => {
  const [tablesData, setTablesData] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark the component as mounted on the client
    setIsMounted(true);

    // Fetch data from localStorage only on the client
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("searchResults");
      if (data) {
        setTablesData(JSON.parse(data));
      }
    }
  }, []);

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

  const exportToCSV = () => {
    console.log("Exporting to CSV, tablesData:", tablesData); // Debug log

    if (!tablesData || Object.keys(tablesData).length === 0 || Object.values(tablesData).every(data => data.length === 0)) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    // Combine all tables into one CSV with headers indicating table type
    const allRows = [];
    
    Object.entries(tablesData).forEach(([tableType, data]) => {
      if (data?.length > 0) {
        const cols = columnDefinitions[tableType].filter(col => col.key !== "action" && col.key !== "show"); // Exclude action columns
        const headers = cols.map(col => col.label).join(",");
        
        // Add table type as a separator row
        allRows.push(`"${tableType.replace("_", " ")}"`);
        allRows.push(headers);

        const tableRows = data.map(item =>
          cols.map(col => {
            let value = item[col.key] || "";
            if (col.type === "date" && value) {
              value = new Date(value).toLocaleDateString(); // Format date
            }
            return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes
          }).join(",")
        );

        allRows.push(...tableRows);
        allRows.push(""); // Empty row for separation between tables
      }
    });

    const csvContent = allRows.join("\n");
    console.log("CSV content:", csvContent); // Debug log

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "search_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Only render content after mounting to ensure localStorage is available
  if (!isMounted) {
    return null; // Or a loading spinner if preferred
  }

  const isEmpty = Object.values(tablesData).every((data) => data?.length === 0);

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar flex flex-col items-center justify-center">
      <p className="text-xl sm:text-2xl font-bold text-[#17a3d7] self-start">
        Search Results
      </p>
      <Header exportFun={exportToCSV}  link="" /> {/* Added Header with export function */}

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

export default Page;
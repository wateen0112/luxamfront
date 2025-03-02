"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/schedules`);

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Process the data to include nested fields
      const processedData = response.data.data.map((item) => ({
        ...item,
        vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
        driver: item.vehicle_driver?.driver?.name || "-",
        company: item.company_branch?.company?.name || "-",
        branch: item.company_branch?.branch_name || "-",
      }));

      console.log("Fetched schedules data:", { ...response.data, data: processedData }); // Debug log
      setCompanies({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch schedules");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  const exportToCSV = () => {
    console.log("Exporting to CSV, companies:", companies); // Debug log
    if (!companies || !Array.isArray(companies.data) || companies.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .filter((col) => col.key !== "action") // Exclude action column
      .map((col) => col.label)
      .join(",");

    const rows = companies.data.map((item) =>
      columnDefinitions
        .filter((col) => col.key !== "action") // Exclude action column
        .map((col) => {
          let value = item[col.key] || "";
          if (col.type === "date" && value) {
            value = new Date(value).toLocaleDateString(); // Format date
          }
          // Escape quotes and wrap in quotes if value contains commas
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    console.log("CSV content:", csvContent); // Debug log

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "schedules.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "vehicle", label: "Vehicle" },
    { key: "driver", label: "Driver" },
    { key: "company", label: "Company" },
    { key: "branch", label: "Branch" },
    { key: "day", label: "Day" },
    { key: "area", label: "Area" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created at", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (companies?.next_page_url) {
      setCurrentPageUrl(companies.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (companies?.prev_page_url) {
      setCurrentPageUrl(companies.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Schedules
        </p>
        <Header link="/admin/collectionScheduling/add" exportFun={exportToCSV} />
        <Table
          data={companies}
          columns={columnDefinitions}
          view={"collectionScheduling"}
          deleteApi={"schedules"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
        {/* Temporary button for testing export */}
   
      </div>
    </div>
  );
};

export default Page;
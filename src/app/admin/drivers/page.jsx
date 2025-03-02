"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [drivers, setDrivers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/drivers`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const formatDriverData = (driverData) => {
    if (!driverData || !driverData.data) {
      return { ...driverData, data: [] }; // Fallback for invalid data
    }
    const formattedData = {
      ...driverData,
      data: driverData.data.map((driver) => ({
        ...driver,
        fullName: `${driver.first_name || ""} ${driver.last_name || ""}`.trim(), // Ensure both fields are strings
      })),
    };
    return formattedData;
  };

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/drivers-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm },
      });

      console.log("Search results:", response.data);
      const formattedResults = formatDriverData(response.data);
      setSearchResults(formattedResults);
    } catch (err) {
      setError("Failed to search drivers");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedDrivers = formatDriverData(response.data);
      console.log("Fetched drivers data:", formattedDrivers); // Debug log
      setDrivers(formattedDrivers);
    } catch (err) {
      setError("Failed to fetch drivers");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const dataToExport = searchResults || drivers;
    console.log("Exporting to CSV, data:", dataToExport); // Debug log

    if (!dataToExport || !Array.isArray(dataToExport.data) || dataToExport.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .filter((col) => col.key !== "action") // Exclude action column
      .map((col) => col.label)
      .join(",");

    const rows = dataToExport.data.map((driver) =>
      columnDefinitions
        .filter((col) => col.key !== "action") // Exclude action column
        .map((col) => {
          let value = driver[col.key] || "";
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
    link.setAttribute("download", "drivers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (search) {
      searchCompanies(search);
    } else {
      fetchDrivers(currentPageUrl);
    }
  }, [search, currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "fullName", label: "Name" },
    { key: "username", label: "User Name" },
    { key: "phone_number", label: "Phone Number" },
    { key: "role", label: "Role" },
    { key: "user_status", label: "Status" },
    { key: "created_at", label: "Created at", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (searchResults?.next_page_url) {
      setCurrentPageUrl(searchResults.next_page_url);
    } else if (drivers?.next_page_url) {
      setCurrentPageUrl(drivers.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (searchResults?.prev_page_url) {
      setCurrentPageUrl(searchResults.prev_page_url);
    } else if (drivers?.prev_page_url) {
      setCurrentPageUrl(drivers.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Drivers</p>
        <Header setSearch={setSearch} link="/admin/drivers/add" exportFun={exportToCSV} />
        <Table
          data={searchResults || drivers}
          view="drivers"
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
        {/* Temporary button for testing export */}
   
      </div>
    </div>
  );
};

export default Page;
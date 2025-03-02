"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Utility function to validate date
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // Returns true if date is valid
};

const Page = () => {
  const [vehicleDrivers, setVehicleDrivers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/vehicles-drivers`);

  const fetchVehicleDrivers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Process the data to include vehicle number and driver name
      const processedData = response.data.data.map((item) => ({
        ...item,
        status: item.end_at && isValidDate(item.end_at) ? item.end_at : "Active",
        vehicle_number: item.vehicle_number || "-", // Use vehicle_number if available
        vehicle_name: item.vehicle_number || "-", // Fallback to vehicle_number if name is null
        driver_name: item.driver_name || "-", // Driver name or fallback
      }));

      console.log("Fetched vehicle drivers data:", { ...response.data, data: processedData }); // Debug log
      setVehicleDrivers({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch vehicle drivers");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    console.log("Exporting to CSV, vehicleDrivers:", vehicleDrivers); // Debug log
    if (!vehicleDrivers || !Array.isArray(vehicleDrivers.data) || vehicleDrivers.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .map((col) => col.label)
      .join(",");

    const rows = vehicleDrivers.data.map((item) =>
      columnDefinitions
        .map((col) => {
          let value = item[col.key] || "";
          if (col.type === "date" && value) {
            value = formatDate(value); // Use the same date formatting as display
          } else if (col.key === "status" && value !== "Active") {
            value = formatDate(value); // Format status if it's a date
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
    link.setAttribute("download", "vehicle_drivers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchVehicleDrivers(currentPageUrl);
  }, [currentPageUrl]);

  useEffect(() => {
    console.log(vehicleDrivers);
  }, [vehicleDrivers]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Handle invalid dates
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const columnDefinitions = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "driver_name", label: "Driver Name" },
    { key: "status", label: "Status", type: (item) => (item.status === "Active" ? "text" : "date") },
    { key: "created_at", label: "Created At", type: "date" },
  ];

  const handleNextPage = () => {
    if (vehicleDrivers?.next_page_url) {
      setCurrentPageUrl(vehicleDrivers.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (vehicleDrivers?.prev_page_url) {
      setCurrentPageUrl(vehicleDrivers.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Vehicle Drivers
        </p>
        <Header assign={true} link="/admin/vehicleDrivers/assign" exportFun={exportToCSV} />
        <Table
          data={vehicleDrivers}
          columns={columnDefinitions}
          view="paymentTypes"
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;
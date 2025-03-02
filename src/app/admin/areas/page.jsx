"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [areas, setAreas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/areas`);

  const fetchAreas = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");
      if (!token) {
        setError("Authentication token is missing.");
        return;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched areas data:", response.data.data); // Debug log
      setAreas(response.data.data);
    } catch (err) {
      setError("Failed to fetch areas");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas(currentPageUrl);
  }, [currentPageUrl]);

  const exportToCSV = () => {
    console.log("Exporting to CSV, areas:", areas); // Debug log
    if (!areas || !Array.isArray(areas.data) || areas.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .filter((col) => col.key !== "action") // Exclude action column
      .map((col) => col.label)
      .join(",");

    const rows = areas.data.map((area) =>
      columnDefinitions
        .filter((col) => col.key !== "action") // Exclude action column
        .map((col) => {
          let value = "";
          if (col.key === "city") {
            value = area.city?.name || "-"; // Use city name
          } else {
            value = area[col.key] || "";
          }
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
    link.setAttribute("download", "areas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "created_at", label: "Created At", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (areas?.next_page_url) {
      setCurrentPageUrl(areas.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (areas?.prev_page_url) {
      setCurrentPageUrl(areas.prev_page_url);
    }
  };

  const tableData = areas?.data?.map((item) => ({
    ...item,
    city: item?.city?.name || "-", // Transform city object to city name
  }));

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Areas</p>
        <Header link="/admin/areas/add" exportFun={exportToCSV} />
        <Table
          data={{ ...areas, data: tableData }}
          columns={columnDefinitions}
          deleteApi={"areas"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="areas"
        />
        {/* Temporary button for testing export */}
   
      </div>
    </div>
  );
};

export default Page;
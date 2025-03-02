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
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/requests`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/requests-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm },
      });

      console.log("Search results:", response.data);
      const processedData = response.data.data.map((item) => ({
        ...item,
        "user-name": item.user?.name || "-",
        address: item.address?.address || "-",
        phone_number: item?.user?.phone_number || "-",
      }));
      setSearchResults({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to search requests");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      searchCompanies(search);
    }
  }, [search]);

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedData = response.data.data.map((item) => ({
        ...item,
        "user-name": item.user?.name || "-",
        address: item.address?.address || "-",
        phone_number: item?.user?.phone_number || "-",
      }));

      console.log("Fetched requests data:", { ...response.data, data: processedData }); // Debug log
      setCompanies({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch requests");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const dataToExport = searchResults || companies;
    console.log("Exporting to CSV, data:", dataToExport); // Debug log

    if (!dataToExport || !Array.isArray(dataToExport.data) || dataToExport.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .filter((col) => col.key !== "show") // Exclude action column (renamed from "show")
      .map((col) => col.label)
      .join(",");

    const rows = dataToExport.data.map((item) =>
      columnDefinitions
        .filter((col) => col.key !== "show") // Exclude action column
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
    link.setAttribute("download", "requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "user-name", label: "User Name" },
    { key: "phone_number", label: "User Phone" },
    { key: "public_id", label: "Public ID" },
    { key: "status", label: "Status" },
    { key: "address", label: "Address" },
    { key: "quantity", label: "Quantity" },
    { key: "collected_at", label: "Collected At", type: "date" },
    { key: "created_at", label: "Created At", type: "date" },
    { key: "show", label: "Action" },
  ];

  const handleNextPage = () => {
    if (searchResults?.next_page_url) {
      setCurrentPageUrl(searchResults.next_page_url);
    } else if (companies?.next_page_url) {
      setCurrentPageUrl(companies.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (searchResults?.prev_page_url) {
      setCurrentPageUrl(searchResults.prev_page_url);
    } else if (companies?.prev_page_url) {
      setCurrentPageUrl(companies.prev_page_url);
    }
  };

  const handleDownload = async () => {
    try {
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/requests_document`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];
      let fileExtension = "";
      if (contentType.includes("pdf")) {
        fileExtension = "pdf";
      } else if (contentType.includes("excel") || contentType.includes("spreadsheetml")) {
        fileExtension = "xlsx";
      } else if (contentType.includes("csv")) {
        fileExtension = "csv";
      } else {
        fileExtension = "dat";
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download the file:", err);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar w-full">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Requests</p>
        <Header
          setSearch={setSearch}
          handleDownload={handleDownload}
          exportFun={exportToCSV} // Updated from true to the export function
          link=""
        />
        <Table
          data={searchResults ? searchResults : companies}
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          view="requests"
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;
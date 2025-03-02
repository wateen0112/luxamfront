"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/dashboard/users`);

  const fetchUsers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched users data:", response.data); // Debug log
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    console.log("Exporting to CSV, users:", users); // Debug log
    if (!users || !Array.isArray(users.data) || users.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .map((col) => col.label)
      .join(",");

    const rows = users.data.map((item) =>
      columnDefinitions
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
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchUsers(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone Number" },
    { key: "role", label: "Role" },
    { key: "user_status", label: "Status" },
    { key: "created_at", label: "Created at", type: "date" },
  ];

  const handleNextPage = () => {
    if (users?.next_page_url) {
      setCurrentPageUrl(users.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (users?.prev_page_url) {
      setCurrentPageUrl(users.prev_page_url);
    }
  };

  const handleDownload = async () => {
    try {
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/users_document`, {
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
      link.href = url ?? "";
      link.setAttribute("download", `document.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download the file:", err);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Users</p>
        <Header
          handleDownload={handleDownload}
          href=""
          link={''}
          exportFun={exportToCSV} // Updated from true to export function
        />
        <Table
          data={users}
          view="users"
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;
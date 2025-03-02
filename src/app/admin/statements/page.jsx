"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const fileUrl = process.env.NEXT_PUBLIC_FILES_URL;

// Function to format date as "dd-mm-yyyy"
const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Not specified";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const Page = () => {
  const [statements, setStatements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/statements`);

  const fetchStatements = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Process the response data to include invoice link and format dates
      const processedData = response.data.data.map((item) => ({
        ...item,
        company: item.company?.name || "-",
        invoice: item.invoice ? `${fileUrl}/statements/invoices/${item.invoice}` : "-",
        proof_of_payment: item.proof_of_payment ? `${fileUrl}/statements/payment_proofs/${item.proof_of_payment}` : "-",
        created_at: formatDate(item.created_at),
      }));

      console.log("Fetched statements data:", { ...response.data, data: processedData }); // Debug log
      setStatements({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch statements");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    console.log("Exporting to CSV, statements:", statements); // Debug log
    if (!statements || !Array.isArray(statements.data) || statements.data.length === 0) {
      console.warn("No valid data to export");
      alert("No data available to export");
      return;
    }

    const headers = columnDefinitions
      .filter((col) => col.key !== "action") // Exclude action column
      .map((col) => col.label)
      .join(",");

    const rows = statements.data.map((item) =>
      columnDefinitions
        .filter((col) => col.key !== "action") // Exclude action column
        .map((col) => {
          let value = item[col.key] || "";
          // For invoice and proof_of_payment, use the raw value (URL or "-")
          if (col.key === "invoice" || col.key === "proof_of_payment") {
            value = item[col.key]; // Already processed as URL or "-"
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
    link.setAttribute("download", "statements.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchStatements(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "company", label: "Company" },
    { key: "month", label: "Month" },
    { key: "status", label: "Status" },
    { 
      key: "invoice", 
      label: "Invoice", 
      render: (row) => (
        row.invoice && row.invoice !== "-" ? (
          <a 
            href={row.invoice} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 underline"
          >
            View Invoice
          </a>
        ) : (
          "-"
        )
      ),
    },
    { 
      key: "proof_of_payment", 
      label: "Proof of payment", 
      render: (row) => (
        row.proof_of_payment && row.proof_of_payment !== "-" ? (
          <a 
            href={row.proof_of_payment} // Fixed to use proof_of_payment instead of invoice
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 underline"
          >
            View Proof
          </a>
        ) : (
          "-"
        )
      ),
    },
    { 
      key: "created_at", 
      label: "Created at", 
      type: "date", 
    },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (statements?.next_page_url) {
      setCurrentPageUrl(statements.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (statements?.prev_page_url) {
      setCurrentPageUrl(statements.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Statements
        </p>
        <Header exportFun={exportToCSV} /> {/* Integrated export function */}
        <Table
          data={statements}
          columns={columnDefinitions}
          view="statements"
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;
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
  const [companyDetails, setCompanyDetails] = useState({});
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/company-branches`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  // Fetch branches and companies
  const fetchCompanies = async (url) => {
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
      console.log("Fetched company branches data:", response.data); // Debug log
      setCompanies(response.data);
      // Fetch company names based on company_ids
      fetchCompanyNames(response.data.data);
    } catch (err) {
      setError("Failed to fetch company branches");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/company-branches-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm },
      });

      console.log("Search results:", response.data);
      setSearchResults(response.data);
      fetchCompanyNames(response.data.data);
    } catch (err) {
      setError("Failed to search company branches");
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

  // Fetch company names based on company_id
  const fetchCompanyNames = async (branches) => {
    try {
      const token = Cookies.get("luxamToken");
      const companyIds = [...new Set(branches.map((branch) => branch.company_id))];
      const responses = await Promise.all(
        companyIds.map((id) =>
          axios.get(`${apiUrl}/company_details/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      console.log("Company details responses:", responses);
      const companiesData = responses.reduce((acc, response) => {
        if (response.data && response.data.id) {
          acc[response.data.id] = response.data.name;
        }
        return acc;
      }, {});
      setCompanyDetails(companiesData);
    } catch (err) {
      console.error("Failed to fetch company names", err);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  const exportToCSV = () => {
    const dataToExport = searchResults || companies;
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

    const rows = dataToExport.data.map((item) =>
      columnDefinitions
        .filter((col) => col.key !== "action") // Exclude action column
        .map((col) => {
          let value = "";
          if (col.key === "company_name") {
            value = companyDetails[item.company_id] || "-"; // Use company name from companyDetails
          } else if (col.key === "address") {
            value = item.address?.address || "-"; // Use address or fallback
          } else {
            value = item[col.key] || "";
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
    link.setAttribute("download", "company_branches.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "company_name", label: "Company" },
    { key: "branch_name", label: "Branch" },
    { key: "branch_code", label: "Branch Code" },
    { key: "area", label: "Area" },
    { key: "address", label: "Address" },
    { key: "created_at", label: "Created at", type: "date" },
    { key: "action", label: "Action" },
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

  const tableData = companies?.data.map((item) => ({
    ...item,
    company_name: companyDetails[item.company_id] || "-",
    address: item.address?.address || "-",
  }));

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Companies Branches
        </p>
        <Header setSearch={setSearch} link="/admin/companiesBranches/add" exportFun={exportToCSV} />
        <Table
          data={searchResults ? searchResults : { ...companies, data: tableData }}
          columns={columnDefinitions}
          deleteApi={"company-branches"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="companiesBranches"
        />
        {/* Temporary button for testing export */}
   
      </div>
    </div>
  );
};

export default Page;
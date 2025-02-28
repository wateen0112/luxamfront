"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Custom function to format date as "dd-mm-yyyy" (e.g., "25-02-2025")
const formatDate = (dateString) => {
  if (!dateString) return "Not specified";

  // Fix malformed date strings like "2025-02-2500:00:00" by adding a space
  let correctedDateString = dateString;
  if (/^\d{4}-\d{2}-\d{2}\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    correctedDateString = dateString.replace(/(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/, "$1 $2");
  }

  // Parse the corrected date string into a Date object
  const date = new Date(correctedDateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString); // Log invalid dates for debugging
    return "Not specified";
  }

  // Extract day, month, and year
  const day = date.getDate().toString().padStart(2, "0"); // Ensure 2 digits (e.g., "25")
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, add 1 (e.g., "02")
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const Page = () => {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/companies`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const processCompanyData = (data) => {
    // Check if data has a 'data' property (pagination response) or is an array
    const companyList = data.data || data;

    // Format dates in each company object
    const formattedCompanies = companyList.map((company) => ({
      ...company,
      contract_start_at: formatDate(company.contract_start_at),
      contract_end_at: formatDate(company.contract_end_at),
      created_at: formatDate(company.created_at),
      updated_at: formatDate(company.updated_at),
    }));

    // Return the original structure with formatted data
    return data.data ? { ...data, data: formattedCompanies } : formattedCompanies;
  };

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedResponse = processCompanyData(response.data);
      setCompanies(formattedResponse);
    } catch (err) {
      setError("Failed to fetch companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null); // Reset search results if search is cleared
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/companies-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm },
      });

      const formattedResponse = processCompanyData(response.data);
      console.log("Search results:", formattedResponse);
      setSearchResults(formattedResponse);
    } catch (err) {
      setError("Failed to search companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  useEffect(() => {
    searchCompanies(search);
  }, [search]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    { key: "contract_start_at", label: "Start At" },
    { key: "contract_end_at", label: "End At" },
    { key: "contract_status", label: "Status" },
    {
      key: "payment_type",
      label: "Payment Type",
      render: (row) => (
        <span className="capitalize">
          {row.payment_type || "Not specified"}
        </span>
      ),
    },
    { key: "documents", label: "Company Documents" },
    { key: "created_at", label: "Created At" },
    { key: "updated_at", label: "Updated At" },
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

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Companies
        </p>
        <Header setSearch={setSearch} link="/admin/companies/add" />
        <Table
          data={searchResults || companies}
          columns={columnDefinitions}
          deleteApi={"companies"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="companies"
        />
      </div>
    </div>
  );
};

export default Page;
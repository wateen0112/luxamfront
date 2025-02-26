"use client";

import React, { useEffect, useState } from "react";
import Header from "components/tableComponents/Header";
import Table from "components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/companies`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompanies(response.data);
    } catch (err) {
      setError("Failed to fetch companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) return;

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/companies-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm },
      });

      console.log("Search results:", response.data);
      setSearchResults(response.data);
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
    if (search) {
      searchCompanies(search);
    }
  }, [search]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    {
      key: "contract_start_at",
      label: "Start at",
      render: (row) => (
        <span>
          {row.contract_start_at
            ? new Date(row.contract_start_at).toLocaleDateString()
            : "Not specified"}
        </span>
      ),
    },
    {
      key: "contract_end_at",
      label: "End at",
      render: (row) => (
        <span>
          {row.contract_end_at
            ? new Date(row.contract_end_at).toLocaleDateString()
            : "Not specified"}
        </span>
      ),
    },
    { key: "contract_status", label: "Status" },
    {
      key: "payment_type",
      label: "Payment Type",
      render: (row) => (
        <span className="capitalize">
          {row.contract_start_at || row.contract_end_at
            ? "contract"
            : row.payment_type || "Not specified"}
        </span>
      ),
    },
    { key: "documents", label: "Company Documents" },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => (
        <span>
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "Not specified"}
        </span>
      ),
    },
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
          data={searchResults ? searchResults : companies}
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
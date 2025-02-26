"use client";

import React, { useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Currency conversion function
const convertCurrency = (aedValue) => {
  const exchangeRates = {
    USD: 0.2723, // 1 AED = 0.2723 USD
    EUR: 0.2510, // 1 AED = 0.2510 EUR
    AED: 1,      // 1 AED = 1 AED (no conversion)
  };

  const currentCurrency = Cookies.get("currency") || "AED";
  const convertedValue = aedValue && !isNaN(aedValue)
    ? (aedValue * exchangeRates[currentCurrency]).toFixed(2)
    : 0;

  return {
    convertedValue,
    currentCurrency,
  };
};

// Main function to handle all logic and rendering
const renderOilCollections = async (currentPageUrl = `${apiUrl}/oil_collections`, setPage = null) => {
  let companies = null;
  let loading = true;
  let error = null;

  const fetchCompanies = async (url) => {
    try {
      const token = Cookies.get("luxamToken");
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Prepare data to include nested fields with fallbacks and currency conversion
      const processedData = response.data.data.map((item) => {
        const rawPrice = item.price || 0;
        const { convertedValue: convertedPrice, currentCurrency } = convertCurrency(rawPrice);
        return {
          ...item,
          vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
          driver: item.vehicle_driver?.driver?.name || "-",
          company: item.company_branch?.company?.name || "-",
          branch: item.company_branch?.branch_name || "-",
          price: rawPrice
            ? `${convertedPrice} ${currentCurrency}`
            : "-",
        };
      });

      companies = { ...response.data, data: processedData };
    } catch (err) {
      error = "Failed to fetch companies";
      console.error(err);
    } finally {
      loading = false;
    }
  };

  // Fetch data initially or for pagination
  await fetchCompanies(currentPageUrl);

  // Updated column definitions with the requested order
  const columnDefinitions = [
    { key: "action", label: "Action" },
    { key: "company", label: "Company" },
    { key: "branch", label: "Company Branch" },
    { key: "collected_liters", label: "Collected Liters" },
    { key: "price", label: "Liters Price" },
    { key: "driver", label: "Driver" },
    { key: "vehicle", label: "Vehicle" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created", type: "date" },
  ];

  const handleNextPage = () => {
    if (companies?.next_page_url) {
      renderOilCollections(companies.next_page_url, setPage);
    }
  };

  const handlePreviousPage = () => {
    if (companies?.prev_page_url) {
      renderOilCollections(companies.prev_page_url, setPage);
    }
  };

  // Return JSX based on current state
  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Oil Collections
        </p>
        <Header link="/admin/oilCollectionScheduling/add" />
        <Table
          data={companies}
          columns={columnDefinitions}
          view="oilCollectionScheduling"
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

// Wrapper component to trigger the initial render
const Page = () => {
  const [pageContent, setPageContent] = useState(null);

  const setPage = (content) => {
    setPageContent(content);
  };

  // Initial render
  if (!pageContent) {
    renderOilCollections(apiUrl + "/oil_collections", setPage).then(setPage);
  }

  return pageContent;
};

export default Page;
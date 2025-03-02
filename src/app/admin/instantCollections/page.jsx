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
const renderInstantCollections = async (currentPageUrl = `${apiUrl}/instant_collections`, setPage = null) => {
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

      let processedData;
      if (response.data.instant_collection) {
        const rawPrice = response.data.instant_collection.price || 0;
        const { convertedValue: convertedPrice, currentCurrency } = convertCurrency(rawPrice);
        processedData = [
          {
            ...response.data.instant_collection,
            company: response.data.instant_collection.company?.name || "-",
            branch: response.data.instant_collection.company_branch?.branch_name || "-",
            vehicle: response.data.instant_collection.vehicle_driver?.vehicle?.vehicle_number || "-",
            driver: response.data.instant_collection.vehicle_driver?.driver?.name || "-",
            payment_type: response.data.instant_collection.payment_type || "-",
            price: rawPrice
              ? `${convertedPrice} ${currentCurrency}`
              : "-",
          },
        ];
        companies = {
          data: processedData,
          current_page: 1,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
        };
      } else if (response.data.data && Array.isArray(response.data.data)) {
        processedData = response.data.data.map((item) => {
          const rawPrice = item.price || 0;
          const { convertedValue: convertedPrice, currentCurrency } = convertCurrency(rawPrice);
          return {
            ...item,
            company: item.company?.name || "-",
            branch: item.company_branch?.branch_name || "-",
            vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
            driver: item.vehicle_driver?.driver?.name || "-",
            payment_type: item.payment_type || "-",
            price: rawPrice
              ? `${convertedPrice} ${currentCurrency}`
              : "-",
          };
        });
        companies = { ...response.data, data: processedData };
      } else {
        processedData = (response.data || []).map((item) => {
          const rawPrice = item.price || 0;
          const { convertedValue: convertedPrice, currentCurrency } = convertCurrency(rawPrice);
          return {
            ...item,
            company: item.company?.name || "-",
            branch: item.company_branch?.branch_name || "-",
            vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
            driver: item.vehicle_driver?.driver?.name || "-",
            payment_type: item.payment_type || "-",
            price: rawPrice
              ? `${convertedPrice} ${currentCurrency}`
              : "-",
          };
        });
        companies = {
          data: processedData,
          current_page: 1,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
        };
      }
    } catch (err) {
      error = "Failed to fetch instant collections";
      console.error(err);
    } finally {
      loading = false;
    }
  };

  // Fetch data initially or for pagination
  await fetchCompanies(currentPageUrl);

  const columnDefinitions = [
    { key: "company", label: "Company" },
    { key: "public_id", label: "Public Id" },
    { key: "branch", label: "Branch" },
    { key: "payment_type", label: "Payment Type" },
    { key: "vehicle", label: "Vehicle" },
    { key: "driver", label: "Driver" },
    { key: "customer_name", label: "Customer Name" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price" },
    { key: "created_at", label: "Created at", type: "date" },
    { key: "collected_at", label: "Collected at", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (companies?.next_page_url) {
      renderInstantCollections(companies.next_page_url, setPage);
    }
  };

  const handlePreviousPage = () => {
    if (companies?.prev_page_url) {
      renderInstantCollections(companies.prev_page_url, setPage);
    }
  };

  // Return JSX based on current state
  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Instant Collections
        </p>
        <Header exportFun={true} link="" />
        <Table
          data={companies}
          columns={columnDefinitions}
          view="instantCollections"
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
    renderInstantCollections(apiUrl + "/instant_collections", setPage).then(setPage);
  }

  return pageContent;
};

export default Page;
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Table from "@/components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(
    `${apiUrl}/instant_collections`
  );

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check the response structure and adapt
      let processedData;
      if (response.data.instant_collection) {
        // If the response contains a single instant_collection object
        processedData = [
          {
            ...response.data.instant_collection,
            company: response.data.instant_collection.company?.name || "-",
            branch: response.data.instant_collection.company_branch?.branch_name || "-",
            vehicle: response.data.instant_collection.vehicle_driver?.vehicle?.vehicle_number || "-",
            driver: response.data.instant_collection.vehicle_driver?.driver?.name || "-",
            payment_type: response.data.instant_collection.payment_type || "-", // Use payment_type from instant_collection
          },
        ];
        setCompanies({
          data: processedData,
          current_page: 1,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null, // Mock pagination for a single item
        });
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If the response is paginated with a data array (like oil collections)
        processedData = response.data.data.map((item) => ({
          ...item,
          company: item.company?.name || "-",
          branch: item.company_branch?.branch_name || "-",
          vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
          driver: item.vehicle_driver?.driver?.name || "-",
          payment_type: item.payment_type || "-", // Use payment_type from the item
        }));
        setCompanies({ ...response.data, data: processedData });
      } else {
        // If the response is an array directly (without pagination)
        processedData = (response.data || []).map((item) => ({
          ...item,
          company: item.company?.name || "-",
          branch: item.company_branch?.branch_name || "-",
          vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
          driver: item.vehicle_driver?.driver?.name || "-",
          payment_type: item.payment_type || "-", // Use payment_type from the item
        }));
        setCompanies({
          data: processedData,
          current_page: 1,
          last_page: 1,
          next_page_url: null,
          prev_page_url: null, // Mock pagination for a flat array
        });
      }
    } catch (err) {
      setError("Failed to fetch instant collections");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

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
      setCurrentPageUrl(companies.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (companies?.prev_page_url) {
      setCurrentPageUrl(companies.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Instant Collections
        </p>
        <Header exportFun={true} link="/admin/companies/add" />
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

export default Page;
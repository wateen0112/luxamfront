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
    `${apiUrl}/oil_collections`
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

      // Prepare data to include nested fields with fallbacks
      const processedData = response.data.data.map((item) => ({
        ...item,
        vehicle: item.vehicle_driver?.vehicle?.vehicle_number || "-",
        driver: item.vehicle_driver?.driver?.name || "-",
        company: item.company_branch?.company?.name || "-",
        branch: item.company_branch?.branch_name || "-",
      }));

      setCompanies({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch companies");
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
          Oil Collections
        </p>
        <Header link="/admin/oilCollectionScheduling/add" />
        <Table
          data={companies}
          columns={columnDefinitions}
          view={"oilCollectionScheduling"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;
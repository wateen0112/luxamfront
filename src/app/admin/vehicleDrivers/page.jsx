"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [vehicleDrivers, setVehicleDrivers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(
    `${apiUrl}/vehicles-drivers`
  );

  const fetchvehicleDrivers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setVehicleDrivers({ ...response.data });
    } catch (err) {
      setError("Failed to fetch vehicleDrivers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchvehicleDrivers(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "driver_name", label: "Driver" },
    { key: "end_at", label: "End At", type: "date" },
    { key: "created_at", label: "Created at", type: "date" },
  ];

  const handleNextPage = () => {
    if (vehicleDrivers?.next_page_url) {
      setCurrentPageUrl(vehicleDrivers.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (vehicleDrivers?.prev_page_url) {
      setCurrentPageUrl(vehicleDrivers.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Vehicle drivers
        </p>
        <Header assign={true} link="/admin/vehicleDrivers/assign" />
        <Table
          data={vehicleDrivers}
          columns={columnDefinitions}
          view="paymentTypes"
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;

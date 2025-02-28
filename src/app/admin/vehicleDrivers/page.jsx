"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Utility function to validate date
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // Returns true if date is valid
};

const Page = () => {
  const [vehicleDrivers, setVehicleDrivers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/vehicles-drivers`);

  const fetchvehicleDrivers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Process the data to include vehicle number and driver name
      const processedData = response.data.data.map((item) => ({
        ...item,
        status: item.end_at && isValidDate(item.end_at) ? item.end_at : "Active",
        vehicle_number: item.vehicle_number || "-", // Use vehicle.vehicle_number if available
        vehicle_name:item.vehicle_number || "-", // Fallback to vehicle_number if name is null
        driver_name: item.driver_name 
        || "-", // Combine driver names if available
      }));

      setVehicleDrivers({ ...response.data, data: processedData });
 
      
    } catch (err) {
      setError("Failed to fetch vehicle drivers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
useEffect(()=>{
  console.log(vehicleDrivers);
},[vehicleDrivers])
  useEffect(() => {
    fetchvehicleDrivers(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "vehicle_number", label: "Vehicle " }, // Display vehicle name or number
    { key: "driver_name", label: "Driver Name" },   // Display driver name
    { key: "status", label: "Status", type: (item) => (item.status === "Active" ? "text" : "date") },
    { key: "created_at", label: "Created At", type: "date" },
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
          Vehicle Drivers
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
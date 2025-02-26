"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [vehicles, setVehicles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/vehicles`);

  const fetchVehicles = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //   console.log(response.data.vehicles)
      setVehicles(response.data.vehicles); // استخراج بيانات المركبات
    } catch (err) {
      setError("Failed to fetch vehicles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "vehicle_number", label: "Vehicle Number" },
    { key: "created_at", label: "Created at", type: "date" },
    { key: "action", label: "Actions" },
  ];

  const handleNextPage = () => {
    if (vehicles?.next_page_url) {
      setCurrentPageUrl(vehicles.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (vehicles?.prev_page_url) {
      setCurrentPageUrl(vehicles.prev_page_url);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Vehicles</p>
        <Header link="/admin/vehicles/add" />
        <Table
          data={vehicles} // تمرير فقط بيانات المركبات
          view="vehicles"
          deleteApi={"vehicles"}
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;

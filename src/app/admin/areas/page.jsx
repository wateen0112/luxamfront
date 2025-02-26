"use client";

import React, { useEffect, useState } from "react";

import Header from "../../../components/tableComponents/Header";
import Table from "../../../components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [areas, setAreas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/areas`);

  const fetchareas = async (url) => {
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
      // console.log(response.data.data.data)
      setAreas(response.data.data);
    } catch (err) {
      setError("Failed to fetch areas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchareas(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "created_at", label: "Created At", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (areas?.next_page_url) {
      setCurrentPageUrl(areas.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (areas?.prev_page_url) {
      setCurrentPageUrl(areas.prev_page_url);
    }
  };

  const tableData = areas?.data?.map((item) => ({
    ...item,
    city: item?.city?.name || "-",
  }));

  console.log(tableData);
  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Areas</p>
        <Header link="/admin/areas/add" />
        <Table
          data={{ ...areas, data: tableData }}
          columns={columnDefinitions}
          deleteApi={"areas"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="areas"
        />
      </div>
    </div>
  );
};

export default Page;

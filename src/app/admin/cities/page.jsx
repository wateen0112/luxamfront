"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Table from "@/components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [cities, setCities] = useState(null); // تحديث الحالة لدعم الكائن الكامل
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/cities`); // رابط الصفحة الحالية

  const fetchcities = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
      setCities(response.data.data); // حفظ الكائن بالكامل، وليس فقط البيانات
    } catch (err) {
      setError("Failed to fetch cities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcities(currentPageUrl); // جلب البيانات بناءً على رابط الصفحة الحالية
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    { key: "created_at", label: "Created At", type: "date" },
    { key: "action", label: "Action" },
  ];

  const handleNextPage = () => {
    if (cities?.next_page_url) {
      setCurrentPageUrl(cities.next_page_url); // تحديث رابط الصفحة الحالية للرابط التالي
    }
  };

  const handlePreviousPage = () => {
    if (cities?.prev_page_url) {
      setCurrentPageUrl(cities.prev_page_url); // تحديث رابط الصفحة الحالية للرابط السابق
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Cities</p>
        <Header link="/admin/cities/add" />
        <Table
          data={cities}
          columns={columnDefinitions}
          deleteApi={"cities"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="cities"
        />
      </div>
    </div>
  );
};

export default Page;

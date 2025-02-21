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
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/requests`);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null); // لتخزين نتائج البحث

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) return; // تجنب إرسال طلب فارغ

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/requests-search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search: searchTerm }, // إرسال الـ search كـ parameter في URL
      });

      console.log("Search results:", response.data);
      setSearchResults(response.data); // حفظ نتائج البحث في الـ state
    } catch (err) {
      setError("Failed to search companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      searchCompanies(search); // تنفيذ البحث عندما يتغير الـ search
    }
  }, [search]); // يعتمد على متغير search

  const fetchCompanies = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // تجهيز البيانات لتضمين user.name كـ user-name
      const processedData = response.data.data.map((item) => ({
        ...item,
        "user-name": item.user?.name || "-",
        address: item.address?.address || "-",
        phone_number: item?.user?.phone_number,
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

  const columnDefinitions = [
    { key: "user-name", label: "User Name" },
    { key: "phone_number", label: "User Phone" },
    { key: "public_id", label: "Public ID" },
    { key: "status", label: "Status" },
    { key: "address", label: "Address" },
    { key: "quantity", label: "Quantity" },
    { key: "collected_at", label: "Collected At", type: "date" },
    { key: "created_at", label: "Created At", type: "date" },
    { key: "show", label: "Action" },
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

  const handleDownload = async () => {
    try {
      const token = Cookies.get("luxamToken");

      // إرسال طلب GET لتحميل الملف
      const response = await axios.get(`${apiUrl}/requests_document`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // لضمان تحميل الملف
      });

      // استخراج نوع الملف من الـ Content-Type
      const contentType = response.headers["content-type"];

      // تحديد امتداد الملف بناءً على Content-Type
      let fileExtension = "";
      if (contentType.includes("pdf")) {
        fileExtension = "pdf";
      } else if (
        contentType.includes("excel") ||
        contentType.includes("spreadsheetml")
      ) {
        fileExtension = "xlsx"; // أو xls إذا كان الملف بتنسيق أقدم
      } else if (contentType.includes("csv")) {
        fileExtension = "csv";
      } else {
        fileExtension = "dat"; // يمكن استخدام هذا كامتداد افتراضي
      }

      // إنشاء رابط لتحميل الملف
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document.${fileExtension}`); // استخدام الامتداد المناسب
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // إزالة الرابط بعد النقر
    } catch (err) {
      console.error("Failed to download the file:", err);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar w-full">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Requests</p>
        <Header
          setSearch={setSearch}
          handleDownload={handleDownload}
          exportFun={true}
          link="/admin/companies/add"
        />
        <Table
          data={searchResults ? searchResults : companies} // استخدم نتائج البحث إذا كانت موجودة
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          view="requests"
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;

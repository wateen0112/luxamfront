"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Table from "@/components/tableComponents/Table";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/users`);

  const fetchUsers = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone Number" },
    { key: "role", label: "Role" },
    { key: "user_status", label: "Status" },
    { key: "created_at", label: "Created at", type: "date" },
  ];

  const handleNextPage = () => {
    if (users?.next_page_url) {
      setCurrentPageUrl(users.next_page_url);
    }
  };

  const handlePreviousPage = () => {
    if (users?.prev_page_url) {
      setCurrentPageUrl(users.prev_page_url);
    }
  };

  const handleDownload = async () => {
    try {
      const token = Cookies.get("luxamToken");

      // إرسال طلب GET لتحميل الملف
      const response = await axios.get(`${apiUrl}/users_document`, {
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
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Users</p>
        <Header handleDownload={handleDownload} exportFun={true} />
        <Table
          data={users}
          view="users"
          columns={columnDefinitions}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
    </div>
  );
};

export default Page;

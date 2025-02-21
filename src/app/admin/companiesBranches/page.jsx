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
  const [companyDetails, setCompanyDetails] = useState({});
  const [currentPageUrl, setCurrentPageUrl] = useState(
    `${apiUrl}/company-branches`
  );
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null); // لتخزين نتائج البحث

  // جلب بيانات الفروع والشركات
  const fetchCompanies = async (url) => {
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
      setCompanies(response.data);
      // جلب تفاصيل الشركات باستخدام company_ids
      fetchCompanyNames(response.data.data);
    } catch (err) {
      setError("Failed to fetch companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (searchTerm) => {
    if (!searchTerm) return; // تجنب إرسال طلب فارغ

    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(`${apiUrl}/company-branches-search`, {
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

  // جلب أسماء الشركات بناءً على company_id
  const fetchCompanyNames = async (branches) => {
    try {
      const token = Cookies.get("luxamToken");
      const companyIds = [
        ...new Set(branches.map((branch) => branch.company_id)),
      ]; // استخراج company_ids المميزة
      const responses = await Promise.all(
        companyIds.map((id) =>
          axios.get(`${apiUrl}/company_details/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      console.log(responses);
      const companiesData = responses.reduce((acc, response) => {
        if (response.data && response.data.id) {
          acc[response.data.id] = response.data.name; // حفظ اسم الشركة مع الـ id
        }
        return acc;
      }, {});
      setCompanyDetails(companiesData);
    } catch (err) {
      console.error("Failed to fetch company names", err);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPageUrl);
  }, [currentPageUrl]);

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const columnDefinitions = [
    { key: "company_name", label: "Company" },
    { key: "branch_name", label: "Branch" },
    { key: "branch_code", label: "Branch Code" },
    { key: "area", label: "Area" },
    { key: "address", label: "Address" }, // عمود العنوان
    { key: "created_at", label: "Created at", type: "date" },
    { key: "action", label: "Action" },
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

  // تعديل البيانات لتمرير اسم الشركة بدلاً من الـ ID أو وضع - إذا لم تكن موجودة
  const tableData = companies?.data.map((item) => ({
    ...item,
    company_name: companyDetails[item.company_id] || "-",
    address: item.address?.address || "-", // استعراض العنوان أو عرض "-" إذا لم يكن موجودًا
  }));

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Companies Branches
        </p>
        <Header setSearch={setSearch} link="/admin/companiesBranches/add" />
        <Table
          data={
            searchResults ? searchResults : { ...companies, data: tableData }
          }
          columns={columnDefinitions}
          deleteApi={"company-branches"}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          view="companiesBranches"
        />
      </div>
    </div>
  );
};

export default Page;

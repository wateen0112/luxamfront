"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const UpdateCompanyPage = () => {
  const router = useRouter();
  const { id } = useParams(); // نحصل على الـ id من الرابط
  const [formData, setFormData] = useState({
    name: "",
    unit_price: "",
    contract_start_at: "",
    contract_end_at: "",
    contract_status: "active",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    unit_price: "",
    contract_start_at: "",
    contract_end_at: "",
    contract_status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (id) {
      // جلب بيانات الشركة باستخدام الـ id عند تحميل الصفحة
      const fetchCompanyData = async () => {
        try {
          const token = Cookies.get("luxamToken");
          if (!token) {
            setError("Authentication token is missing.");
            return;
          }

          const response = await axios.get(`${apiUrl}/company_details/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const companyData = response.data;
          setOriginalData({
            name: companyData.name || "",
            unit_price: companyData.unit_price || "",
            contract_start_at: companyData.contract_start_at || "",
            contract_end_at: companyData.contract_end_at || "",
            contract_status: companyData.contract_status || "active",
          });
          setFormData({
            name: companyData.name || "",
            unit_price: companyData.unit_price || "",
            contract_start_at: companyData.contract_start_at || "",
            contract_end_at: companyData.contract_end_at || "",
            contract_status: companyData.contract_status || "active",
          });
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to fetch company data."
          );
        }
      };

      fetchCompanyData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get("luxamToken");
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    // التحقق من أن الـ unit_price غير فارغ فقط إذا كانت قيمته قد تغيرت
    if (
      formData.unit_price === "" &&
      formData.unit_price !== originalData.unit_price
    ) {
      setError("Unit price is required.");
      setLoading(false);
      return;
    }

    // تحويل التواريخ إلى الصيغة المطلوبة
    const requestData = {};
    if (formData.name !== originalData.name) requestData.name = formData.name;
    if (formData.unit_price !== originalData.unit_price)
      requestData.unit_price = parseFloat(formData.unit_price);
    if (formData.contract_start_at !== originalData.contract_start_at)
      requestData.contract_start_at = formData.contract_start_at;
    if (formData.contract_end_at !== originalData.contract_end_at)
      requestData.contract_end_at = formData.contract_end_at;
    if (formData.contract_status !== originalData.contract_status)
      requestData.contract_status = formData.contract_status;

    // التأكد من أن التواريخ هي بتنسيق "yyyy-mm-dd"
    if (formData.contract_start_at) {
      const startDate = new Date(formData.contract_start_at);
      requestData.contract_start_at = startDate.toISOString().split("T")[0];
    }
    if (formData.contract_end_at) {
      const endDate = new Date(formData.contract_end_at);
      requestData.contract_end_at = endDate.toISOString().split("T")[0];
    }

    if (Object.keys(requestData).length === 0) {
      setError("No changes made.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/companies/${id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      router.push("/admin/companies");
      setSuccess("Company updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the company."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:px-16 px-8 py-8 max-w-6xl mx-auto">
      <header>
        <h1 className="md:text-3xl text-2xl font-bold text-[#de8945]">
          Update Company
        </h1>
      </header>

      <main className="mt-10">
        {error && <p className="text-red-600">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 md:gap-8 gap-6"
        >
          <InputField
            label="Company Name"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            label="Unit Price"
            id="unit_price"
            type="number"
            value={formData.unit_price}
            onChange={handleChange}
          />
          <InputField
            label="Contract Start At"
            id="contract_start_at"
            type="date"
            value={formData.contract_start_at}
            onChange={handleChange}
          />
          <InputField
            label="Contract End At"
            id="contract_end_at"
            type="date"
            value={formData.contract_end_at}
            onChange={handleChange}
          />
          <SelectField
            label="Contract Status"
            id="contract_status"
            value={formData.contract_status}
            onChange={handleChange}
            options={[
              { value: "active", label: "Active" },
              { value: "deactive", label: "Deactive" },
            ]}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-16 py-2 bg-[#de8945] text-lg text-white rounded-md font-semibold w-full col-span-2"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </main>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
    />
  </div>
);

const SelectField = ({ label, id, value, onChange, options }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default UpdateCompanyPage;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const UpdateCompanyPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the company ID from the URL

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
  const [currency, setCurrency] = useState("AED"); // Default to AED for SSR

  // Fetch currency from cookies only on client side
  useEffect(() => {
    const cookieCurrency = Cookies.get("currency") || "AED";
    setCurrency(cookieCurrency);
  }, []);

  // Fetch company data when the page loads
  useEffect(() => {
    if (id) {
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

  // Hardcoded exchange rates (AED as base)
  const exchangeRates = {
    AED: 1,
    USD: 0.27, // 1 AED ≈ 0.27 USD
    EUR: 0.25, // 1 AED ≈ 0.25 EUR
  };

  // Convert AED to other currencies
  const convertPrice = (valueInAED) => {
    if (!valueInAED || isNaN(valueInAED)) return { USD: "N/A", EUR: "N/A" };
    return {
      USD: (valueInAED * exchangeRates.USD).toFixed(2),
      EUR: (valueInAED * exchangeRates.EUR).toFixed(2),
    };
  };

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

    // Validate unit_price only if it has changed and is empty
    if (
      formData.unit_price === "" &&
      formData.unit_price !== originalData.unit_price
    ) {
      setError("Unit price is required.");
      setLoading(false);
      return;
    }

    // Prepare request data with only changed fields
    const requestData = {};
    if (formData.name !== originalData.name) requestData.name = formData.name;
    if (formData.unit_price !== originalData.unit_price)
      requestData.unit_price = parseFloat(formData.unit_price); // Always in AED
    if (formData.contract_start_at !== originalData.contract_start_at)
      requestData.contract_start_at = formData.contract_start_at;
    if (formData.contract_end_at !== originalData.contract_end_at)
      requestData.contract_end_at = formData.contract_end_at;
    if (formData.contract_status !== originalData.contract_status)
      requestData.contract_status = formData.contract_status;

    // Format dates to "yyyy-mm-dd"
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

  const convertedPrices = convertPrice(parseFloat(formData.unit_price) || 0);

  return (
    <div className="md:px-16 px-8 py-8 max-w-6xl mx-auto">
      <header>
        <h1 className="md:text-3xl text-2xl font-bold text-[#de8945]">
          Update Company
        </h1>
      </header>

      <main className="mt-10">
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
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
          <div>
            <InputField
              label="Unit Price (AED)" // Always in AED
              id="unit_price"
              type="number"
              value={formData.unit_price}
              onChange={handleChange}
            />
            {currency !== "AED" && formData.unit_price > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span>USD {convertedPrices.USD} </span>
                <span>EUR {convertedPrices.EUR}</span>
              </div>
            )}
          </div>
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
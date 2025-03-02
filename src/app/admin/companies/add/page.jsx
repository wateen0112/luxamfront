"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddCompanyPage = () => {
  const triggerNotification = useNotification();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    company: "",
    unitPrice: "",
    contractStartAt: "",
    contractEndAt: "",
    contractStatus: "active",
    paymentType: "cash",
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
      triggerNotification("Authentication token is missing.", "warning");
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "password",
      "company",
      "unitPrice",
      "contractStatus",
      "paymentType",
    ];

    if (formData.paymentType === "contract") {
      requiredFields.push("contractStartAt", "contractEndAt");
    }

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      triggerNotification(
        `Please fill in all fields. Missing: ${emptyFields.join(", ")}`,
        "error"
      );
      setError(`Please fill in all fields. Missing: ${emptyFields.join(", ")}`);
      setLoading(false);
      return;
    }

    if (formData.paymentType === "contract") {
      const startDate = new Date(formData.contractStartAt);
      const endDate = new Date(formData.contractEndAt);

      if (endDate <= startDate) {
        triggerNotification(
          "Contract end date must be after the contract start date.",
          "error"
        );
        setLoading(false);
        return;
      }
    }

    const requestData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phoneNumber,
      password: formData.password,
      name: formData.company,
      unit_price: parseFloat(formData.unitPrice), // Always in AED
      contract_start_at: formData.contractStartAt,
      contract_end_at: formData.contractEndAt,
      contract_status: formData.contractStatus,
      payment_type: formData.paymentType,
    };

    try {
      const response = await axios.post(`${apiUrl}/companies`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      router.push("/admin/companies");
      setSuccess("Company added successfully!");
      triggerNotification("Company added successfully!", "success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        company: "",
        unitPrice: "",
        contractStartAt: "",
        contractEndAt: "",
        contractStatus: "active",
        paymentType: "cash",
      });
    } catch (err) {
      triggerNotification(
        err.response?.data?.email || "An error occurred while adding the company.",
        "error"
      );
      console.log(err);
      setError(
        err.response?.data?.email || "An error occurred while adding the company."
      );
    } finally {
      setLoading(false);
    }
  };

  const convertedPrices = convertPrice(parseFloat(formData.unitPrice) || 0);

  return (
    <div className="md:px-16 px-8 py-8 max-w-6xl mx-auto">
      <header>
        <h1 className="md:text-3xl text-2xl font-bold text-[#de8945]">
          Add Company
        </h1>
      </header>

      <main className="mt-10">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 md:gap-8 gap-6">
          {/* User Info Section */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-[#17a3d7] mb-4">
              User Info
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
              />
              <InputField
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                label="Phone Number"
                id="phoneNumber"
                type="number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <InputField
                label="Password"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company Info Section */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-[#17a3d7] mb-4">
              Company Info
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Company"
                id="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
              />
              <div>
                <InputField
                  label="Unit Price (AED)" // Always AED
                  id="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={handleChange}
                />
                {currency !== "AED" && formData.unitPrice > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span>USD {convertedPrices.USD} </span>
                    <span>EUR {convertedPrices.EUR}</span>
                  </div>
                )}
              </div>
              <InputField
                label="Contract Start At"
                id="contractStartAt"
                type="date"
                value={formData.contractStartAt}
                onChange={handleChange}
                disabled={formData.paymentType === "cash"}
              />
              <InputField
                label="Contract End At"
                id="contractEndAt"
                type="date"
                value={formData.contractEndAt}
                onChange={handleChange}
                disabled={formData.paymentType === "cash"}
              />
              <SelectField
                label="Contract Status"
                id="contractStatus"
                value={formData.contractStatus}
                onChange={handleChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "deactive", label: "Deactive" },
                ]}
                disabled={formData.paymentType === "cash"}
              />
              <SelectField
                label="Payment Type"
                id="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "contract", label: "Contract" },
                ]}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-16 py-2 bg-[#de8945] text-lg text-white rounded-md font-semibold w-full col-span-2"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
        {success && <p className="mt-4 text-green-600">{success}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </main>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange, disabled }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label} *
    </label>
    <input
      id={id}
      type={type}
      value={value}
      min={type === "number" ? 1 : undefined}
      onChange={onChange}
      disabled={disabled}
      className={`input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, id, value, onChange, options, disabled }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label} *
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none ${
        disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default AddCompanyPage;
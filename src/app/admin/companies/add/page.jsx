"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";
import useCurrencyConversion from "../../../../app/hooks/useCurrencyChange";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddCompanyPage = () => {
  const currencyConversion = useCurrencyConversion();
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
    paymentType: "cash", // Default to "cash" or "contract"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const currency = Cookies.get("currency");

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

    // Validate required fields
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

    // Only require contract dates if payment type is "contract"
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

    // Validate contract dates only if payment type is "contract"
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
      unit_price: parseFloat(formData.unitPrice),
      contract_start_at: formData.contractStartAt,
      contract_end_at: formData.contractEndAt,
      contract_status: formData.contractStatus,
      payment_type: formData.paymentType, // Include payment type in the request
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
        paymentType: "cash", // Reset to default
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
                <div className="grid grid-cols-4 items-center gap-3">
                  <div className={currency !== "AED" && formData.unitPrice > 0 ? "col-span-3" : "col-span-4"}>
                    <InputField
                      className="w-full"
                      label="Unit Price"
                      id="unitPrice"
                      type="number"
                      value={formData.unitPrice}
                      onChange={handleChange}
                    />
                  </div>
                  {currency !== "AED" && formData.unitPrice > 0 && (
                    <span className="mt-8">{currency + " " + currencyConversion(formData.unitPrice).convertedValue}</span>
                  )}
                </div>
              </div>
              <InputField
                label="Contract Start At"
                id="contractStartAt"
                type="date"
                value={formData.contractStartAt}
                onChange={handleChange}
                disabled={formData.paymentType === "cash"} // Disable if payment type is "cash"
              />
              <InputField
                label="Contract End At"
                id="contractEndAt"
                type="date"
                value={formData.contractEndAt}
                onChange={handleChange}
                disabled={formData.paymentType === "cash"} // Disable if payment type is "cash"
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
                disabled={formData.paymentType === "cash"} // Disable when payment type is "cash"
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
      min={type === "number" ? 1 : undefined} // Add min value for number inputs
      onChange={onChange}
      disabled={disabled} // Add disabled prop
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
      disabled={disabled} // Add disabled prop
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
"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notifi/NotificationContext";

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

    // التحقق من الحقول الفارغة
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "password",
      "company",
      "unitPrice",
      "contractStartAt",
      "contractEndAt",
      "contractStatus",
    ];

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

    // التحقق من صحة التواريخ
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
      });
    } catch (err) {
      triggerNotification(
        err.response?.data?.email ||
          "An error occurred while adding the company.",
        "error"
      );
      console.log(err);
      setError(
        err.response?.data?.email ||
          "An error occurred while adding the company."
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
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 md:gap-8 gap-6"
        >
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
          <InputField
            label="Company"
            id="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
          />
          <InputField
            label="Unit Price"
            id="unitPrice"
            type="number"
            
            value={formData.unitPrice}
            onChange={handleChange}
          />
          <InputField
            label="Contract Start At"
            id="contractStartAt"
            type="date"
            value={formData.contractStartAt}
            onChange={handleChange}
          />
          <InputField
            label="Contract End At"
            id="contractEndAt"
            type="date"
            value={formData.contractEndAt}
            onChange={handleChange}
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
          />
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

const InputField = ({   label, id, type, value, onChange }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label} *
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
      {label} *
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

export default AddCompanyPage;

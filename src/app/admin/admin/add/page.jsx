"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";
// import { useNotification } from "../../../../";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddAdminPage = () => {
  const triggerNotification = useNotification();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    phone: "",
    password: "",
    confirmPassword: "",
    permissions: [],
  });

  const [error, setError] = useState("");

  const fields = [
    { label: "First Name", name: "firstName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Position", name: "position", type: "text" },
    { label: "Phone Number", name: "phone", type: "tel" },
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password" },
  ];

  const permissionsList = [
    { label: "View News", name: "view_news" },
    { label: "Create Redeem Points", name: "create_redeem_points" },
    { label: "Update Company Branches", name: "update_company_branches" },
    { label: "Delete Vehicles", name: "delete_vehicles" },
    { label: "View Vehicle Driver", name: "view_vehicle_driver" },
    { label: "Delete Plants", name: "delete_plants" },
    { label: "View Requests", name: "view_requests" },
    { label: "Cancel Requests", name: "cancel_requests" },
    { label: "Update Schedules", name: "update_schedules" },
    { label: "Delete Companies", name: "delete_companies" },
    { label: "Create Team Members", name: "create_team_members" },
    { label: "Update Plants", name: "update_plants" },
    { label: "Search Drivers", name: "search_drivers" },
    { label: "Search News", name: "search_news" },
    { label: "Create Cities", name: "create_cities" },
    { label: "Update News", name: "update_news" },
    { label: "Update Areas", name: "update_areas" },
    { label: "Create Instant Collections", name: "create_instant_collections" },
    { label: "Create Admins", name: "create_admins" },
    { label: "View Oil Collections", name: "view_oil_collections" },
    { label: "View Company Branches", name: "view_company_branches" },
    { label: "Create Admin", name: "create_admin" },
    { label: "View Statements", name: "view_statements" },
    { label: "Delete News", name: "delete_news" },
    { label: "Update Instant Collections", name: "update_instant_collections" },
    { label: "Delete Admins", name: "delete_admins" },
    { label: "Create Requests", name: "create_requests" },
    { label: "View Admins", name: "view_admins" },
    { label: "Update Redeem Points", name: "update_redeem_points" },
    { label: "Search Requests", name: "search_requests" },
    { label: "View Drivers", name: "view_drivers" },
    { label: "View Plants", name: "view_plants" },
    { label: "Assign Vehicle Driver", name: "assign_vehicle_driver" },
    { label: "Create Oil Collections", name: "create_oil_collections" },
    { label: "Update Oil Collections", name: "update_oil_collections" },
    { label: "Filter Schedules", name: "filter_schedules" },
    { label: "Create Companies", name: "create_companies" },
    { label: "Update Settings", name: "update_settings" },
    { label: "Create Schedules", name: "create_schedules" },
    { label: "Search Companies", name: "search_companies" },
    { label: "Reject Requests", name: "reject_requests" },
    { label: "Verify Statements", name: "verify_statements" },
    { label: "Search Users", name: "search_users" },
    { label: "Update Cities", name: "update_cities" },
    { label: "Create Areas", name: "create_areas" },
    { label: "Create Vehicles", name: "create_vehicles" },
    { label: "View Users", name: "view_users" },
    { label: "Dashboard Access", name: "dashboard_access" },
    { label: "Update Drivers", name: "update_drivers" },
    { label: "Update Companies", name: "update_companies" },
    { label: "Update Payment Types", name: "update_payment_types" },
    { label: "Update Users", name: "update_users" },
    { label: "View Team Members", name: "view_team_members" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        permissions: checked
          ? [...formData.permissions, value]
          : formData.permissions.filter((permission) => permission !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length <= 7) {
      triggerNotification(
        "The password must be more than 7 characters",
        "warning"
      );
      return; // إيقاف التنفيذ دون إظهار رسالة
    }

    // تحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      triggerNotification("Passwords do not match", "error");
      return;
    }

    // تهيئة البيانات التي سيتم إرسالها
    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      phone_number: formData.phone,
      position: formData.position,
      permissions: formData.permissions,
    };

    try {
      const token = Cookies.get("luxamToken");
      const response = await axios.post(`${apiUrl}/add-admin`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/admin/admin");
    } catch (error) {
      if (error.response) {
        console.log(error.response);
        triggerNotification(
          error.response.data.errors.email || "An error occurred",
          "error"
        );
        setError(error.response.data.errors.email || "An error occurred");
      } else {
        triggerNotification("Network error or server is down", "error");
        setError("Network error or server is down");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-16">
      <h2 className="text-3xl font-semibold text-center mb-6 text-[#de8945]">
        Add Admin
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {fields.map((field, index) => (
            <div key={index} className="w-full">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label} *
              </label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          ))}
        </div>

        {/* قسم الصلاحيات */}
        <div className="mb-6 mt-10">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {permissionsList.map((permission, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  name={permission.name}
                  value={permission.name}
                  checked={formData.permissions.includes(permission.name)}
                  onChange={handleChange}
                  id={permission.name}
                  className="h-4 w-4 text-[#de8945] focus:ring-[#de8945] border-gray-300 rounded"
                />
                <label
                  htmlFor={permission.name}
                  className="ml-2 text-lg text-gray-700"
                >
                  {permission.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#de8945] text-white font-semibold rounded-md hover:bg-[#c5723c] transition duration-200"
        >
          Add Admin
        </button>
      </form>
    </div>
  );
};

export default AddAdminPage;

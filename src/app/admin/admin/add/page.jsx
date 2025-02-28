"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Function to convert snake_case to Title Case (e.g., "show_admins" → "Show Admins")
const formatPermissionName = (name) => {
  return name
    .split("_") // Split by underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join with spaces
};

const AddAdminPage = () => {
  const [permissionsList, setPermissionsList] = useState([]);
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

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/permissions`);
      setPermissionsList(res.data);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "allPermissions") {
        // Handle "All Permissions" checkbox
        const allPermissionNames = permissionsList.map((perm) => perm.name);
        setFormData({
          ...formData,
          permissions: checked ? allPermissionNames : [],
        });
      } else {
        // Handle individual permission checkboxes
        setFormData({
          ...formData,
          permissions: checked
            ? [...formData.permissions, value]
            : formData.permissions.filter((permission) => permission !== value),
        });
      }
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
      return; // Stop execution without showing an error
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      triggerNotification("Passwords do not match", "error");
      return;
    }

    // Prepare data to send
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
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="allPermissions"
              value="allPermissions"
              checked={formData.permissions.length === permissionsList.length}
              onChange={handleChange}
              id="allPermissions"
              className="h-4 w-4 text-[#de8945] focus:ring-[#de8945] border-gray-300 rounded"
            />
            <label
              htmlFor="allPermissions"
              className="ml-2 text-lg text-gray-700 font-semibold"
            >
              All Permissions
            </label>
          </div>
        </div>

        {/* Permissions Section with "All Permissions" Checkbox */}
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
                  disabled={formData.permissions.length === permissionsList.length} // Disable if all permissions are selected
                />
                <label
                  htmlFor={permission.name}
                  className="ml-2 text-lg text-gray-700"
                >
                  {formatPermissionName(permission.name)}
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
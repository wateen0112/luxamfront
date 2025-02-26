"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddDriverPage = () => {
  const triggerNotification = useNotification();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // تحقق من أن الباسوورد أطول من 9 أحرف
    if (formData.password.length <= 8) {
      triggerNotification(
        "Password must be more than 8 characters.",
        "warning"
      );
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("luxamToken");
      await axios.post(`${apiUrl}/drivers`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      router.push("/admin/drivers"); // إعادة التوجيه بعد الإضافة الناجحة
    } catch (err) {
      triggerNotification(err.response.data.errors.username, "error");
      console.log(err.response.data.errors.username);

      // setError("Failed to add driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[95%] sm:max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl mt-24 mx-">
      <h2 className="text-3xl font-semibold text-[#de8945] text-center mb-6">
        Add Driver
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de8945]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[#de8945] text-white font-semibold rounded-lg hover:bg-[#de8945]/90 transition-all duration-300"
        >
          {loading ? "Adding..." : "Add Driver"}
        </button>
      </form>
    </div>
  );
};

export default AddDriverPage;

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/components/notifi/NotificationContext";

const UpdateDriverForm = () => {
  const triggerNotification = useNotification();

  const { id } = useParams(); // استخراج id من URL
  const [vehicleNumber, setVehicleNumber] = useState(""); // Vehicle number input field
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL من .env

  useEffect(() => {
    // تحميل البيانات الحالية للسائق بناءً على id
    const fetchDriverData = async () => {
      const token = Cookies.get("luxamToken");

      try {
        const response = await axios.get(`${apiUrl}/vehicles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setVehicleNumber(response.data.vehicle.vehicle_number); // تحديث الرقم الحالي للمركبة
      } catch (error) {
        console.error("Error fetching driver data:", error);
        alert("Failed to load driver data.");
      }
    };

    fetchDriverData();
  }, [id, apiUrl]);

  // ✅ Submit تحديث السائق
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("luxamToken");

    if (!vehicleNumber.trim()) {
      alert("Please enter the vehicle number");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${apiUrl}/vehicles/${id}`,
        { vehicle_number: vehicleNumber },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/admin/vehicles");
      setVehicleNumber("");
    } catch (error) {
      console.error("Error updating vehicle:", error?.response?.data?.message);
      triggerNotification(error?.response?.data?.message, "error");
      // alert("Failed to update vehicle, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col max-w-lg mx-auto gap-4 mt-24"
    >
      <input
        type="text"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
        placeholder="Enter vehicle number"
        className="border p-2 rounded outline-none"
      />
      <button
        type="submit"
        className="bg-[#de8945] text-white px-4 py-2 rounded hover:bg-[#de8945]/90 transition-all"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Vehicle"}
      </button>
    </form>
  );
};

export default UpdateDriverForm;

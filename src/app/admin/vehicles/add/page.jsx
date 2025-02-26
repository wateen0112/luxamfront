"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const VehicleForm = () => {
  const triggerNotification = useNotification()
  const [vehicleNumber, setVehicleNumber] = useState(""); // Vehicle number input field
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL from .env

  // ✅ Submit vehicle when the add button is clicked
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("luxamToken");

    if (!vehicleNumber.trim()) {
      alert("Please enter the vehicle number");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${apiUrl}/vehicles`,
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
      triggerNotification(error?.response?.data?.errors?.vehicle_number, "error")
      console.log(error?.response?.data?.errors?.vehicle_number)
      console.error("Error adding vehicle:", error);
      // alert("Failed to add vehicle, please try again.");
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
        {loading ? "Adding..." : "Add Vehicle"}
      </button>
    </form>
  );
};

export default VehicleForm;

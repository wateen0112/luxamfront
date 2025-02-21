"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const { id } = useParams();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [area, setArea] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const router = useRouter();
  const triggerNotification = useNotification();

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchData = async () => {
      try {
        const citiesRes = await axios.get(`${apiUrl}/cities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCities(citiesRes.data.data.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const token = Cookies.get("luxamToken");

    if (!token) {
      triggerNotification(
        "Authentication token is missing. Please log in again."
      );
      // alert("Authentication token is missing. Please log in again.");
      return;
    }

    // بناء الكائن data بناءً على الحقول المتوفرة فقط
    const data = {};

    if (selectedCity && selectedCity.id) {
      data.city_id = selectedCity.id || id; // إضافة city_id إذا كانت موجودة
    }

    if (area) {
      data.name = area; // إضافة name إذا كانت موجودة
    }

    if (Object.keys(data).length === 0) {
      triggerNotification("Please provide at least one field (City or Area).");
      // alert("Please provide at least one field (City or Area).");
      return;
    }

    try {
      console.log(data); // تأكد من بيانات الـ request قبل الإرسال
      const response = await axios.put(`${apiUrl}/areas/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      router.push("/admin/areas");

      setSelectedCity(null);
      setArea("");
    } catch (error) {
      console.error("Error submitting data:", error);
      triggerNotification("Failed to assign area to city. Please try again.");
      // alert("Failed to assign area to city. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-16">
      <div className="p-6 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#de8945]">
          Assign Area to City
        </h2>

        {/* City Selection */}
        <div className="relative mb-6">
          <div
            className="w-full p-4 bg-gray-200 rounded-lg flex items-center justify-between cursor-pointer"
            onClick={() => setIsCityOpen(!isCityOpen)}
          >
            <span>{selectedCity ? selectedCity.name : "Select a city"}</span>
            <ChevronDown
              className={`transition-transform ${
                isCityOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <AnimatePresence>
            {isCityOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-white shadow-md rounded-lg overflow-hidden z-10 max-h-60 overflow-y-auto"
              >
                {cities.map((city) => (
                  <li
                    key={city.id}
                    className="p-4 hover:bg-blue-100 cursor-pointer transition"
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                  >
                    {city.name}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Area Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Enter area"
            className="w-full p-4 bg-gray-200 rounded-lg"
          />
        </div>

        <button
          className="w-full bg-[#de8945] text-white py-3 rounded-lg text-lg hover:bg-[#de8945]/90 transition-all"
          onClick={handleSubmit}
        >
          Confirm Assignment
        </button>
      </div>
    </div>
  );
};

export default Page;

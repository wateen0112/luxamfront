"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [area, setArea] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchData = async () => {
      try {
        const citiesRes = await axios.get(`${apiUrl}/cities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCities(citiesRes.data.data.data); // Ensure the API response is formatted correctly
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCity || !area) {
      alert("Please select a city and enter an area.");
      return;
    }
    const token = Cookies.get("luxamToken");

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("city_id", selectedCity.id);
    formData.append("name", area);
    console.log(selectedCity.id)
    try {
      const response = await axios.post(`${apiUrl}/areas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/admin/areas");

      // Optionally reset selection
      setSelectedCity(null);
      setArea("");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to assign area to city. Please try again.");
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

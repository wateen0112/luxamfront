"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          axios.get(`${apiUrl}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/drivers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setVehicles(vehiclesRes.data.vehicles.data);
        // Format driver names using first_name and last_name
        const formattedDrivers = driversRes.data.data.map(driver => ({
          ...driver,
          fullName: `${driver.first_name} ${driver.last_name || ''}`.trim()
        }));
        setDrivers(formattedDrivers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedVehicle || !selectedDriver) {
      alert("Please select a vehicle and a driver.");
      return;
    }

    const token = Cookies.get("luxamToken");

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("vehicle_id", selectedVehicle.id);
    formData.append("driver_id", selectedDriver.id);

    try {
      const response = await axios.post(
        `${apiUrl}/vehicles-drivers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      router.push("/admin/vehicleDrivers");
      console.log("Response:", response.data);

      // Optionally reset selection
      setSelectedVehicle(null);
      setSelectedDriver(null);
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to assign driver to vehicle. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-16">
      <div className=" p-6 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#de8945]">
          Assign Driver to Vehicle
        </h2>

        {/* Driver Selection */}
        <div className="relative mb-6">
          <div
            className="w-full p-4 bg-gray-200 rounded-lg flex items-center justify-between cursor-pointer"
            onClick={() => setIsDriverOpen(!isDriverOpen)}
          >
            <span>
              {selectedDriver ? selectedDriver.fullName : "Select a driver"}
            </span>
            <ChevronDown
              className={`transition-transform ${
                isDriverOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <AnimatePresence>
            {isDriverOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-white shadow-md rounded-lg overflow-hidden z-10 max-h-60 overflow-y-auto"
              >
                {drivers.map((driver) => (
                  <li
                    key={driver.id}
                    className="p-4 hover:bg-blue-100 cursor-pointer transition"
                    onClick={() => {
                      setSelectedDriver(driver);
                      setIsDriverOpen(false);
                    }}
                  >
                    {driver.fullName}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Vehicle Selection */}
        <div className="relative mb-6">
          <div
            className="w-full p-4 bg-gray-200 rounded-lg flex items-center justify-between cursor-pointer"
            onClick={() => setIsVehicleOpen(!isVehicleOpen)}
          >
            <span>
              {selectedVehicle
                ? selectedVehicle.vehicle_number
                : "Select a vehicle"}
            </span>
            <ChevronDown
              className={`transition-transform ${
                isVehicleOpen ? "rotate-180" : ""
              }`}
            />
          </div>
          <AnimatePresence>
            {isVehicleOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-white shadow-md rounded-lg overflow-hidden z-10 max-h-60 overflow-y-auto"
              >
                {vehicles.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className="p-4 hover:bg-blue-100 cursor-pointer transition"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setIsVehicleOpen(false);
                    }}
                  >
                    {vehicle.vehicle_number}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
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
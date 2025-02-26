"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai"; // Import sorting icons
import { toast } from "react-toastify";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // Loading state for update button
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Success message state
  const [settings, setSettings] = useState({
    ucoPrice: "",
    address: "",
    addressLong: "",
    addressLat: "",
    isPointsEnabled: false,
    currency: "AED", // Default currency
    unit: "Liter", // Default unit
  });

  // Fetch settings from the backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken"); // Ensure token is included if required by your API
      const response = await axios.get(`${apiUrl}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Map the API response to the settings state
      setSettings({
        ucoPrice: response.data.data.uco_price || "",
        address: response.data.data.address || "",
        addressLong: response.data.data.long || "",
        addressLat: response.data.data.lat || "",
        isPointsEnabled: response.data.data.is_points_enable === true || response.data.data.is_points_enable === "1",
        currency: Cookies.get("currency") || "AED", // Get currency from cookies or default to AED
        unit: Cookies.get("unit") || "Liter", // Get unit from cookies or default to Liter
      });
    } catch (err) {
      setError("Failed to fetch settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle update settings
  const handleUpdateSettings = async () => {
    // Input validation
    if (!settings.ucoPrice || isNaN(settings.ucoPrice)) {
      setError("UCO Price must be a valid number");
      return;
    }
    if (!settings.addressLong || isNaN(settings.addressLong)) {
      setError("Longitude must be a valid number");
      return;
    }
    if (!settings.addressLat || isNaN(settings.addressLat)) {
      setError("Latitude must be a valid number");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);

      // Save currency and unit to cookies
      Cookies.set("currency", settings.currency, { expires: 365 }); // Save for 1 year
      Cookies.set("unit", settings.unit, { expires: 365 }); // Save for 1 year

      const token = Cookies.get("luxamToken"); // Ensure token is included if required by your API
      const response = await axios.post(`${apiUrl}/update_settings`, {
        uco_price: settings.ucoPrice,
        address: settings.address,
        long: settings.addressLong,
        lat: settings.addressLat,
        is_points_enable: settings.isPointsEnabled ? "1" : "0",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Settings updated successfully!`)
      if (response.data.message === "Settings updated Successfully !") {
        setSuccessMessage("Settings updated successfully!");

       
        // Re-fetch settings after successful update
        await fetchSettings();
      }
    } catch (err) {
      setError("Failed to update settings");
      console.error(err.response?.data?.message || err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Settings</p>

        {/* Display error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Display success message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* General Information Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">General Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">UCO Price</label>
              <input
                type="number"
                value={settings.ucoPrice}
                onChange={(e) => setSettings({ ...settings, ucoPrice: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter UCO Price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter Address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  value={settings.addressLong}
                  onChange={(e) => setSettings({ ...settings, addressLong: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Longitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  value={settings.addressLat}
                  onChange={(e) => setSettings({ ...settings, addressLat: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Latitude"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Settings Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700">Platform Settings</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                value={settings.unit}
                onChange={(e) => setSettings({ ...settings, unit: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Liter">Liter</option>
                <option value="KG">KG</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.isPointsEnabled}
                  onChange={(e) => setSettings({ ...settings, isPointsEnabled: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Points</span>
              </label>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="w-full flex mt-8 justify-end items-center">
          <button
            onClick={handleUpdateSettings}
            disabled={updating}
            className="bg-[#fa892d] py-2 px-5 rounded-lg text-white disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
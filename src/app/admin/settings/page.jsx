"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai"; // Import sorting icons

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    ucoPrice: "",
    address: "",
    addressLong: "",
    addressLat: "",
    isPointsEnabled: false,
  });

  // Fetch settings from the backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/settings`);
      setSettings({
        ucoPrice: response.data.uco_price,
        address: response.data.address,
        addressLong: response.data.long,
        addressLat: response.data.lat,
        isPointsEnabled: response.data.is_points_enable,
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
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/update_settings`, {
        uco_price: settings.ucoPrice,
        address: settings.address,
        long: settings.addressLong,
        lat: settings.addressLat,
        is_points_enable: settings.isPointsEnabled ? "1" : "0",
      });

      if (response.data.message === "Settings updated Successfully !") {
        // Re-fetch settings after successful update
        await fetchSettings();
      }
    } catch (err) {
      setError("Failed to update settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">Settings</p>

        {/* General Information Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">General Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">UCO Price</label>
              <input
                type="text"
                value={settings.ucoPrice}
                onChange={(e) => setSettings({ ...settings, ucoPrice: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="text"
                  value={settings.addressLong}
                  onChange={(e) => setSettings({ ...settings, addressLong: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="text"
                  value={settings.addressLat}
                  onChange={(e) => setSettings({ ...settings, addressLat: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Settings Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700">Platform Settings</h2>
          <div className="mt-4">
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
          className="bg-[#fa892d] py-2 px-5 rounded-lg text-white"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Page;
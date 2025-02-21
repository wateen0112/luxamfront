"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const UpdateCities = () => {
  const router = useRouter();
  const { id } = useParams();
  const [cities, setCities] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = Cookies.get("luxamToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cities) {
      setMessage({ type: "error", text: "Please enter a City" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
     const response = await axios.put(
        `${apiUrl}/cities/${id}`,
        { name: cities },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response)
      router.push("/admin/cities");
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred, please try again",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-[#17a3d7]">
        Update City
      </h2>
      {message && (
        <div
          className={`p-2 mb-4 text-center rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={cities}
          onChange={(e) => setCities(e.target.value)}
          placeholder="Enter City"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#de8945]/90"
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-[#de8945] text-white rounded hover:bg-[#de8945]/90 transition-all"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default UpdateCities;

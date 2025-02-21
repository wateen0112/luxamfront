"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CreatePaymentType = () => {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState("");
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
    if (!paymentType) {
      setMessage({ type: "error", text: "Please enter a payment type" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await axios.post(
        `${apiUrl}/payment_types`,
        { payment_type: paymentType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/admin/paymentTypes");
      setPaymentType("");
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
        Add Payment Type
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
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          placeholder="Enter payment type (e.g., PayPal)"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#de8945]/90"
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-[#de8945] text-white rounded hover:bg-[#de8945]/90 transition-all"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Add"}
        </button>
      </form>
    </div>
  );
};

export default CreatePaymentType;

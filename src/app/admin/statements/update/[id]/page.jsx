"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Loading from "../../../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Hardcoded conversion rates (AED as base currency)
const CONVERSION_RATES = {
  AED: 1,          // Base currency
  USD: 0.272,      // 1 AED = 0.272 USD
  EUR: 0.245,      // 1 AED = 0.245 EUR
};

const CURRENCY_SYMBOLS = {
  AED: "AED ",
  USD: "$",
  EUR: "€",
};

const StatementPage = () => {
  const { id } = useParams();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("processing");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currency, setCurrency] = useState("AED"); // Default to AED

  useEffect(() => {
    // Fetch currency from cookies, default to AED if not set
    const storedCurrency = Cookies.get("currency") || "AED";
    setCurrency(storedCurrency.toUpperCase());

    const fetchStatement = async () => {
      try {
        const token = Cookies.get("luxamToken");
        const response = await axios.get(`${apiUrl}/statements/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStatementData(response.data);
        setStatus(response.data.current_status || "processing");
      } catch (err) {
        setError("Failed to load statement data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatement();
  }, [id]);

  const handleMarkAsVerified = async () => {
    setIsUpdating(true);
    try {
      const token = Cookies.get("luxamToken");
      await axios.post(
        `${apiUrl}/change_statement_status`,
        {
          statement_id: id,
          status: "verified",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("verified");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Convert price from AED to selected currency
  const convertPrice = (priceInAed) => {
    const rate = CONVERSION_RATES[currency] || 1; // Fallback to 1 if currency not found
    return priceInAed * rate;
  };

  // Sample data for the table, converted to selected currency
  const tableData = statementData?.collections?.map((item) => {
    const priceInAed = item.collected_price || 450;
    const quantity = item.collected_liters || 200;
    const totalAmount = convertPrice(priceInAed);
    const rate = totalAmount / quantity;

    return {
      date: item.created_at || "2025-02-22 21:43:00",
      driver: item.vehicle_driver?.driver?.first_name + " " + item.vehicle_driver?.driver?.last_name || "Sami Ullah",
      location: item.company_branch?.branch_name || "Al Lisaili",
      companyName: item.company_branch?.company?.name || "Al Lisaili",
      vehicleNo: item.vehicle_driver?.vehicle?.vehicle_number || "89644 H DXB",
      quantityLiters: quantity,
      rate: rate,
      totalAmount: totalAmount,
    };
  }) || [];

  // Calculate totals in selected currency
  const totalLiters = tableData.reduce((sum, item) => sum + (item.quantityLiters || 0), 0);
  const totalRate = tableData.length ? tableData.reduce((sum, item) => sum + (item.rate || 0), 0) / tableData.length : convertPrice(2.25);
  const totalAmount = tableData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const vat = totalAmount * 0.05; // 5% VAT
  const payableAmount = totalAmount + vat;

  const currencySymbol = CURRENCY_SYMBOLS[currency] || "AED "; // Default to AED symbol

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#1e3a8a]">Statement Details</h1>
        <div className="flex items-center gap-4">
          <span
            className={`px-4 py-2 rounded-full text-white ${
              status === "processing" ? "bg-[#7e5bef]" : "bg-[#10b981]"
            }`}
          >
            {status === "processing" ? "Processing" : "Verified"}
          </span>
          {status === "processing" && (
            <button
              onClick={handleMarkAsVerified}
              disabled={isUpdating}
              className="bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition"
            >
              {isUpdating ? "Updating..." : "Mark As Verified"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 font-semibold text-gray-700">Date</th>
                <th className="p-3 font-semibold text-gray-700">Driver/Helper</th>
                <th className="p-3 font-semibold text-gray-700">Location</th>
                <th className="p-3 font-semibold text-gray-700">Company Name</th>
                <th className="p-3 font-semibold text-gray-700">Vch No.</th>
                <th className="p-3 font-semibold text-gray-700">Quantity Liters</th>
                <th className="p-3 font-semibold text-gray-700">Rate</th>
                <th className="p-3 font-semibold text-gray-700">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-all">
                  <td className="p-4 text-gray-700">
                    {new Date(item.date).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-700">{item.driver}</td>
                  <td className="p-4 text-gray-700">{item.location}</td>
                  <td className="p-4 text-gray-700">{item.companyName}</td>
                  <td className="p-4 text-gray-700">{item.vehicleNo}</td>
                  <td className="p-4 text-gray-700">{item.quantityLiters}</td>
                  <td className="p-4 text-gray-700">{currencySymbol}{item.rate.toFixed(2)}</td>
                  <td className="p-4 text-gray-700">{currencySymbol}{item.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="5">
                  Total
                </td>
                <td className="p-4 text-gray-700">{totalLiters}</td>
                <td className="p-4 text-gray-700">{currencySymbol}{totalRate.toFixed(2)}</td>
                <td className="p-4 text-gray-700">{currencySymbol}{totalAmount.toFixed(2)}</td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="7">
                  VAT 5%
                </td>
                <td className="p-4 text-gray-700">{currencySymbol}{vat.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <p className="text-gray-700 font-semibold">
            Total Payable Amount: {currencySymbol}{payableAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatementPage;
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Loading from "../../../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const StatementPage = () => {
  const { id } = useParams();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("processing"); // Default status from the image
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const token = Cookies.get("luxamToken");
        const response = await axios.get(`${apiUrl}/statements/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStatementData(response.data);
        setStatus(response.data.status || "processing"); // Set status from API response
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

  // Sample data for the table (replace with actual API response data)
  const tableData = statementData?.data?.map((item) => ({
    date: item.created_at || "2025-02-22 21:43:00",
    driver: item.vehicle_driver?.driver?.name || "Sami Ullah",
    location: item.company_branch?.branch_name || "Al Lisaili",
    companyName: item.company_branch?.company?.name || "Al Lisaili",
    vehicleNo: item.vehicle_driver?.vehicle?.vehicle_number || "89644 H DXB",
    quantityLiters: item.quantity || 200,
    rate: item.price / item.quantity || 2.25, // Calculate rate (price per liter)
    totalAmount: item.price || 450,
  })) || [];

  // Calculate totals
  const totalLiters = tableData.reduce((sum, item) => sum + (item.quantityLiters || 0), 0);
  const totalRate = tableData.length ? tableData.reduce((sum, item) => sum + (item.rate || 0), 0) / tableData.length : 2.25;
  const totalAmount = tableData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const vat = totalAmount * 0.05; // 5% VAT
  const payableAmount = totalAmount + vat;

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
                  <td className="p-4 text-gray-700">{item.rate.toFixed(2)}</td>
                  <td className="p-4 text-gray-700">{item.totalAmount}</td>
                </tr>
              ))}
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="5">
                  Total
                </td>
                <td className="p-4 text-gray-700">{totalLiters}</td>
                <td className="p-4 text-gray-700">{totalRate.toFixed(2)}</td>
                <td className="p-4 text-gray-700">{totalAmount}</td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="7">
                  VAT 5%
                </td>
                <td className="p-4 text-gray-700">{vat.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <p className="text-gray-700 font-semibold">
            Total Payable Amount: {payableAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatementPage;
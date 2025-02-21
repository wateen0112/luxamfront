"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const StatementPage = () => {
  const { id } = useParams();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState(""); // تخزين الحالة الجديدة
  const [isUpdating, setIsUpdating] = useState(false); // لتحديد حالة التحديث
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
      } catch (err) {
        setError("Failed to load statement.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatement();
  }, [id]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setIsUpdating(true);
    try {
      const token = Cookies.get("luxamToken");
      await axios.post(
        `${apiUrl}/change_statement_status`,
        {
          statement_id: id,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatementData((prev) => ({
        ...prev,
        statement: { ...prev.statement, status: newStatus },
      }));
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 mb-10">
      <h1 className="text-3xl font-semibold text-[#17a3d7] text-center mb-6">
        Statement Details
      </h1>
      <div className="bg-[#fdf2eb] p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Statement Info :</h2>
        <ul className="mt-2 text-gray-700 flex flex-col gap-4">
          <li>
            <strong>Month:</strong> {statementData.statement.month}
          </li>
          <li>
            <strong>Status:</strong> {statementData.statement.status}
          </li>
          <li>
            <strong>Created At:</strong>{" "}
            {new Date(statementData.statement.created_at).toLocaleString()}
          </li>
        </ul>

        {/* تحديث الحالة */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Change Status:
          </label>
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border p-2 rounded-lg cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={handleStatusChange}
              disabled={isUpdating}
              className="bg-[#17a3d7] text-white px-4 py-2 rounded-lg hover:bg-[#148bbd] transition"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#fdf2eb] p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold">Collections</h2>
        {statementData.collections.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-max w-full mt-2 border-collapse text-center">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-3 font-semibold">Branch</th>
                  <th className="p-3 font-semibold">Driver</th>
                  <th className="p-3 font-semibold">Public ID</th>
                  <th className="p-3 font-semibold">Liters</th>
                  <th className="p-3 font-semibold">Price</th>
                  <th className="p-3 font-semibold">Collected At</th>
                  <th className="p-3 font-semibold">Address</th>
                </tr>
              </thead>
              <tbody>
                {statementData.collections.map((collection, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-[#fde6d7] transition-all"
                  >
                    <td className="p-4 text-gray-700">
                      {collection.branch_name}
                    </td>
                    <td className="p-4 text-gray-700">
                      {collection.driver_name}
                    </td>
                    <td className="p-4 text-gray-700">
                      {collection.public_id}
                    </td>
                    <td className="p-4 text-gray-700">
                      {collection.collected_liters ?? "-"}
                    </td>
                    <td className="p-4 text-gray-700">
                      {collection.collected_price ?? "-"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(collection.collected_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-700">{collection.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No collections available.</p>
        )}
      </div>

      <div className="bg-[#fdf2eb] p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold">Summary :</h2>
        <ul className="mt-2 text-gray-700 flex flex-col gap-4">
          <li>
            <strong>Total Liters:</strong> {statementData.total_liters}
          </li>
          <li>
            <strong>Total Amount:</strong> {statementData.total_amount}
          </li>
          <li>
            <strong>Total Result:</strong> {statementData.total_result}
          </li>
          <li>
            <strong>VAT:</strong> {statementData.vat}
          </li>
          <li>
            <strong>Total Payable:</strong> {statementData.total_payable_amount}
          </li>
          <li>
            <strong>Current Status:</strong> {statementData.current_status}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StatementPage;

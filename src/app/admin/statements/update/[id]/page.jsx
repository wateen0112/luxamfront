"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Loading from "../../../../../components/Loading";
import { AiOutlineEye } from "react-icons/ai";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Hardcoded conversion rates (AED as base currency)
const CONVERSION_RATES = {
  AED: 1,          // Base currency
  USD: 0.272,      // 1 AED = 0.272 USD
  EUR: 0.245,      // 1 AED = 0.245 EUR
};

// Conversion rate: 1 liter of oil ≈ 0.85 kilograms (adjust based on oil density)
const LITERS_TO_KILOGRAMS = 0.85;

const CURRENCY_SYMBOLS = {
  AED: "AED ",
  USD: "USD",
  EUR: "EUR",
};

const StatementPage = () => {
  const { id } = useParams();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("processing"); // Initial status
  const [isUpdating, setIsUpdating] = useState(false);
  const [currency, setCurrency] = useState(Cookies.get("currency") || "AED");
  const [unitPreference, setUnitPreference] = useState(Cookies.get("unit") || "Liter");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    // Fetch currency and unit preference from cookies
    const storedCurrency = Cookies.get("currency") || "AED";
    const storedUnit = Cookies.get("unit") || "Liter";
    setCurrency(storedCurrency.toUpperCase());
    setUnitPreference(storedUnit);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("luxamToken");

        // Fetch statement data
        const statementResponse = await axios.get(`${apiUrl}/statements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatementData(statementResponse.data);
        setStatus(statementResponse.data.current_status || "processing");

        // Set invoice and proof files from response if available
        const collection = statementResponse.data.collections[0] || {};
        setInvoiceFile(collection.collected_image || null);
        setProofFile(collection.payment_proof || null);
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
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
      setError(err.response?.data?.message || "Failed to update status to verified.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsUpdating(true);
    try {
      const token = Cookies.get("luxamToken");
      await axios.post(
        `${apiUrl}/change_statement_status`,
        {
          statement_id: id,
          status: "paid",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("paid");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status to paid.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInvoiceUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadLoading(true);
      try {
        const token = Cookies.get("luxamToken");
        const formData = new FormData();
        formData.append('invoice_image', file);

        const response = await axios.post(
          `${apiUrl}/upload-invoice/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setInvoiceFile(response.data.image_path || file.name);
        setError(null);
        console.log("Invoice uploaded successfully:", response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to upload invoice.");
        console.error("Invoice upload error:", err);
        setInvoiceFile(null);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleProofUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadLoading(true);
      try {
        const token = Cookies.get("luxamToken");
        const formData = new FormData();
        formData.append('proof_of_payment', file);

        const response = await axios.post(
          `${apiUrl}/upload-payment-proof/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setProofFile(response.data.file_path || file.name);
        setError(null);
        console.log("Payment proof uploaded successfully:", response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to upload payment proof.");
        console.error("Payment proof upload error:", err);
        setProofFile(null);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Dynamic table data based on statement collections
  const tableData = statementData?.collections?.map((collection) => ({
    date: collection.collected_at ? new Date(collection.collected_at).toLocaleString() : "",
    driver: `${collection.vehicle_driver?.driver?.first_name || ""} ${collection.vehicle_driver?.driver?.last_name || ""}`,
    location: collection.company_branch?.branch_name || "",
    companyName: collection.company_branch?.company?.name || "",
    id: collection.id,
    vehicleNo: collection.vehicle_driver?.vehicle?.vehicle_number || "",
    quantityLiters: collection.collected_liters || 0,
    rate: collection.collected_price || 0,
    totalAmount: (collection.collected_liters || 0) * (collection.collected_price || 0),
  })) || [];

  // Calculate totals
  const totalLiters = tableData.reduce((sum, item) => sum + (item.quantityLiters || 0), 0);
  const totalQuantity = unitPreference === "KG" ? (totalLiters * LITERS_TO_KILOGRAMS).toFixed(2) : totalLiters;
  const totalRate = tableData.length ? tableData.reduce((sum, item) => sum + (item.rate || 0), 0) / tableData.length : 0;
  const totalAmount = tableData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const transformedTotalAmount = currency !== "AED" ? (totalAmount * CONVERSION_RATES[currency]).toFixed(2) : totalAmount.toFixed(2);
  const vat = (totalAmount * 0.05).toFixed(2); // 5% VAT in AED
  const transformedVat = currency !== "AED" ? (vat * CONVERSION_RATES[currency]).toFixed(2) : vat;
  const payableAmount = (totalAmount + parseFloat(vat)).toFixed(2);
  const transformedPayableAmount = currency !== "AED" ? (payableAmount * CONVERSION_RATES[currency]).toFixed(2) : payableAmount;

  const currencySymbol = CURRENCY_SYMBOLS[currency] || "AED ";

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 mb-10">
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-[#1e3a8a]">Statement Details</h1>
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-full text-white ${
                status === "processing" ? "bg-[#7e5bef]" : 
                status === "verified" ? "bg-[#10b981]" : 
                "bg-green-600"
              }`}
            >
              {status === "processing" ? "Processing" : 
               status === "verified" ? "Verified" : 
               "Paid"}
            </span>
            {status === "processing" && (
              <button
                onClick={handleMarkAsVerified}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg text-white ${
                  isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-[#10b981] hover:bg-[#059669]"
                } transition`}
              >
                {isUpdating ? "Updating..." : "Mark as Verified"}
              </button>
            )}
            {status === "verified" && (
              <button
                onClick={handleMarkAsPaid}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg text-white ${
                  isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                } transition`}
              >
                {isUpdating ? "Updating..." : "Mark as Paid"}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 font-semibold text-gray-700">Date</th>
                <th className="p-3 font-semibold text-gray-700">Driver/Helper</th>
                <th className="p-3 font-semibold text-gray-700">Location</th>
                <th className="p-3 font-semibold text-gray-700">Company Name</th>
                <th className="p-3 font-semibold text-gray-700">Vch No.</th>
                <th className="p-3 font-semibold text-gray-700">Quantity {unitPreference === "Liter" ? "Liters" : "Kilograms"}</th>
                <th className="p-3 font-semibold text-gray-700">Rate ({currencySymbol})</th>
                <th className="p-3 font-semibold text-gray-700">Total Amount ({currencySymbol})</th>
                <th className="p-3 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => {
                const transformedQuantity = unitPreference === "KG" ? (item.quantityLiters * LITERS_TO_KILOGRAMS).toFixed(2) : item.quantityLiters;
                const transformedRate = transformPrice(item.rate);
                const transformedTotal = (item.quantityLiters * transformedRate).toFixed(2);
                return (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-all">
                    <td className="p-4 text-gray-700">{item.date}</td>
                    <td className="p-4 text-gray-700">{item.driver}</td>
                    <td className="p-4 text-gray-700">{item.location}</td>
                    <td className="p-4 text-gray-700">{item.companyName}</td>
                    <td className="p-4 text-gray-700">{item.vehicleNo}</td>
                    <td className="p-4 text-gray-700">{transformedQuantity}</td>
                    <td className="p-4 text-gray-700">{currencySymbol}{transformedRate}</td>
                    <td className="p-4 text-gray-700">{currencySymbol}{transformedTotal}</td>
                    <td className="p-4 text-blue-500">
                      <Link href={`/admin/oilCollectionScheduling/update/${item.id}`}>
                        <AiOutlineEye color="blue-500" size={20} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="5">
                  Total
                </td>
                <td className="p-4 text-gray-700">{totalQuantity}</td>
                <td className="p-4 text-gray-700">{currencySymbol}{totalRate.toFixed(2)}</td>
                <td className="p-4 text-gray-700">{currencySymbol}{transformedTotalAmount}</td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-gray-700 font-semibold" colSpan="7">
                  VAT 5% ({currencySymbol})
                </td>
                <td className="p-4 text-gray-700">{currencySymbol}{transformedVat}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <p className="text-gray-700 font-semibold">
            Total Payable Amount: {currencySymbol}{transformedPayableAmount}
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <label className={`bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] cursor-pointer transition ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Upload Invoice {uploadLoading && '(Uploading...)'}
            <input
              type="file"
              accept="image/*"
              onChange={handleInvoiceUpload}
              className="hidden"
              disabled={uploadLoading || statementData.statement.invoice}
            />
          </label>
          <label className={`bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] cursor-pointer transition ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Upload Proof of Payment {uploadLoading && '(Uploading...)'}
            <input
              type="file"
              accept="*/*"
              onChange={handleProofUpload}
              className="hidden"
              disabled={uploadLoading || statementData.statement.proof_of_payment}
            />
          </label>
        </div>

        {/* Display uploaded file names */}
        {invoiceFile && (
          <p className="mt-2 text-gray-700">Selected Invoice: {invoiceFile}</p>
        )}
        {proofFile && (
          <p className="mt-2 text-gray-700">Selected Proof of Payment: {proofFile}</p>
        )}
      </div>
    </div>
  );

  // Transform price based on currency
  function transformPrice(priceInAed) {
    if (currency !== "AED" && priceInAed) {
      return (parseFloat(priceInAed) * CONVERSION_RATES[currency]).toFixed(2);
    }
    return parseFloat(priceInAed) || 0;
  }
};

export default StatementPage;
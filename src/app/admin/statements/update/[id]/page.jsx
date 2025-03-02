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
  const [drivers, setDrivers] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [branches, setBranches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("verified"); // Match Image 2 status
  const [isUpdating, setIsUpdating] = useState(false);
  const [currency, setCurrency] = useState(Cookies.get("currency") || "AED"); // Fetch from cookies, default to AED
  const [unitPreference, setUnitPreference] = useState(Cookies.get("unit") || "Liter"); // Fetch from cookies, default to Liter
  const [invoiceFile, setInvoiceFile] = useState(null); // State for invoice path or file name
  const [proofFile, setProofFile] = useState(null); // State for payment proof path or file name
  const [uploadLoading, setUploadLoading] = useState(false); // State for upload loading status
  const [formData, setFormData] = useState({
   
    collectedLiters: 0, // Always in liters for input and storage
    collectedPrice: 0,  // Always in AED for input and storage
   
  });

  useEffect(() => {
    // Fetch currency and unit preference from cookies, default to AED and Liter
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
        setStatus(statementResponse.data.current_status || "verified");

        // Pre-fill form data and files from the response if available
        const collection = statementResponse.data.collections[0] || {};
        setFormData({
         
       
          collectedLiters: collection.collected_liters || 0, // Always in liters
          collectedPrice: collection.collected_price || 0,  // Always in AED
        
        });

        // Pre-fill invoice and proof files if they exist (store as paths or names)
        setInvoiceFile(collection.collected_image || null);
        setProofFile(collection.payment_proof || null);

        // Fetch drivers
     
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  // Fetch branches based on company ID
  const fetchBranches = async (companyId, token) => {
    try {
      const response = await axios.get(`${apiUrl}/company-branches/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(response.data.data || response.data); // Adjust based on your API response structure
    } catch (err) {
      setError("Failed to load branches for this company.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (formData.company) {
      const token = Cookies.get("luxamToken");
      fetchBranches(formData.company, token);
    } else {
      setBranches(null); // Clear branches if no company is selected
    }
  }, [formData.company]);

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

  // Handle form input changes (only for collectedLiters and collectedPrice)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "collectedLiters" || name === "collectedPrice") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Transform liters to kilograms or keep as liters
  const transformQuantity = (liters) => {
    if (unitPreference === "KG" && liters) {
      return (parseFloat(liters) * LITERS_TO_KILOGRAMS).toFixed(2); // Convert to kilograms
    }
    return parseFloat(liters) || 0; // Return as liters (default)
  };

  // Transform price from AED to selected currency or keep as AED
  const transformPrice = (priceInAed) => {
    if (currency !== "AED" && priceInAed) {
      return (parseFloat(priceInAed) * CONVERSION_RATES[currency]).toFixed(2); // Convert to selected currency
    }
    return parseFloat(priceInAed) || 0; // Return as AED (default)
  };

  // Handle form submission (Update button) for quantity and price only
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = Cookies.get("luxamToken");

      // Send collectedLiters as liters (main unit) and collectedPrice as AED (main currency) to backend
      await axios.patch(
        `${apiUrl}/update_statement_collection/${statementData.collections[0].id}`, // Updated endpoint to match backend
        {
          collected_liters: parseFloat(formData.collectedLiters) || 0, // Always send in liters
          collected_price: parseFloat(formData.collectedPrice) || 0, // Always send in AED
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update collection data.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle invoice file upload directly on file selection
  const handleInvoiceUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadLoading(true); // Start loading
      try {
        const token = Cookies.get("luxamToken");
        const formData = new FormData();
        formData.append('invoice_image', file);

        // Use the collection ID from statementData
        const collectionId = statementData?.collections[0]?.id;
        if (!collectionId) {
          throw new Error("No collection ID found in statement data.");
        }

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
        setInvoiceFile(response.data.image_path || file.name); // Update with the stored path or file name
        setError(null);
        console.log("Invoice uploaded successfully:", response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to upload invoice.");
        console.error("Invoice upload error:", err);
        setInvoiceFile(null); // Clear file if upload fails
      } finally {
        setUploadLoading(false); // End loading
      }
    }
  };

  // Handle payment proof file upload directly on file selection
  const handleProofUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadLoading(true); // Start loading
      try {
        const token = Cookies.get("luxamToken");
        const formData = new FormData();
        formData.append('proof_of_payment', file);

        // Use the collection ID from statementData
        const collectionId = statementData?.collections[0]?.id;
        if (!collectionId) {
          throw new Error("No collection ID found in statement data.");
        }

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
        setProofFile(response.data.file_path || file.name); // Update with the stored path or file name
        setError(null);
        console.log("Payment proof uploaded successfully:", response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to upload payment proof.");
        console.error("Payment proof upload error:", err);
        setProofFile(null); // Clear file if upload fails
      } finally {
        setUploadLoading(false); // End loading
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  // Dynamic data for the table based on statementData collections
  const tableData = statementData?.collections?.map((collection) => ({
    date: collection.collected_at ? new Date(collection.collected_at).toLocaleString() : "",
    driver: `${collection.vehicle_driver?.driver?.first_name || ""} ${collection.vehicle_driver?.driver?.last_name || ""}`,
    location: collection.company_branch?.branch_name || "",
    companyName: collection.company_branch?.company?.name || "",
    vehicleNo: collection.vehicle_driver?.vehicle?.vehicle_number || "",
    quantityLiters: collection.collected_liters || 0,
    rate: transformPrice(collection.collected_price), // Transform price for display
    totalAmount: collection.collected_liters * transformPrice(collection.collected_price),
  })) || [];

  // Calculate totals in selected currency and unit
  const totalLiters = tableData.reduce((sum, item) => sum + (item.quantityLiters || 0), 0);
  const totalQuantity = unitPreference === "KG" ? (totalLiters * LITERS_TO_KILOGRAMS).toFixed(2) : totalLiters;
  const totalRate = tableData.length ? tableData.reduce((sum, item) => sum + (item.rate || 0), 0) / tableData.length : 0;
  const totalAmount = tableData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const transformedTotalAmount = currency !== "AED" ? (totalAmount * CONVERSION_RATES[currency]).toFixed(2) : totalAmount.toFixed(2);
  const vat = (totalAmount * 0.05).toFixed(2); // 5% VAT in AED
  const transformedVat = currency !== "AED" ? (vat * CONVERSION_RATES[currency]).toFixed(2) : vat;
  const payableAmount = (totalAmount + parseFloat(vat)).toFixed(2); // In AED
  const transformedPayableAmount = currency !== "AED" ? (payableAmount * CONVERSION_RATES[currency]).toFixed(2) : payableAmount;

  const currencySymbol = CURRENCY_SYMBOLS[currency] || "AED"; // Default to AED to match main currency

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 mb-10">
      {/* Statement Details Table (moved above the form) */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
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
            {/* Removed the "Mark As Verified" button since Image 2 shows "Verified" status */}
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

        {/* Upload Buttons (Direct Upload on File Selection with Loading) */}
        <div className="mt-6 flex gap-4 justify-end">
          <label className={`bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] cursor-pointer transition ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Upload Invoice {uploadLoading && '(Uploading...)'}
            <input
              type="file"
              accept="image/*" // Updated to accept only images for invoice
              onChange={handleInvoiceUpload}
              className="hidden"
              disabled={uploadLoading||statementData.statement.invoice}
            />
          </label>
          <label className={`bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] cursor-pointer transition ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Upload Proof of Payment {uploadLoading && '(Uploading...)'}
            <input
            
              type="file"
              accept="*/*" // Accepts any file type for payment proof
              onChange={handleProofUpload}
              className="hidden"
              disabled={uploadLoading||statementData.statement.proof_of_payment}
            />
          </label>
        </div>


        {/* Display uploaded file names (optional) */}
        {invoiceFile && (
          <p className="mt-2 text-gray-700">Selected Invoice: {invoiceFile || "No file selected"}</p>
        )}
        {proofFile && (
          <p className="mt-2 text-gray-700">Selected Proof of Payment: {proofFile || "No file selected"}</p>
        )}
      </div>

      {/* Oil Collection Statement Form (moved below the table) */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-[#1e3a8a] mb-4">Oil Collection - Statement</h2>
        <form className="grid gap-6">
      
      
      
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700">Collected Liters *</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="collectedLiters"
                value={formData.collectedLiters}
                onChange={handleInputChange}
                className="mt-1 block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter in Liters"
              />
              {unitPreference === "KG" && (
                <span className="text-sm text-gray-500">
                  ({(formData.collectedLiters * LITERS_TO_KILOGRAMS).toFixed(2)} KG)
                </span>
              )}
            </div>
          </div>
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700">Collected Price *</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="collectedPrice"
                value={formData.collectedPrice}
                onChange={handleInputChange}
                className="mt-1 block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter in AED"
              />
              {currency !== "AED" && (
                <span className="text-sm text-gray-500">
                  ({CURRENCY_SYMBOLS[currency]}{transformPrice(formData.collectedPrice)})
                </span>
              )}
            </div>
          </div>
       
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-[#10b981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition mt-4"
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StatementPage;
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// CustomDropdown component
const CustomDropdown = ({
  label,
  options,
  onSelect,
  openDropdown,
  setOpenDropdown,
  value,
}) => {
  const isOpen = openDropdown === label;

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpenDropdown(isOpen ? null : label);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setOpenDropdown(null);
  };

  return (
    <div className="w-full">
      <label className="block text-gray-700 font-medium mb-1">{label} *</label>
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center bg-white transition-all"
        >
          {value?.label || `Select ${label}`}
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full max-h-[250px] hide-scrollbar overflow-y-auto bg-white border border-gray-300 rounded-lg z-10 overflow-hidden top-full mt-2"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#de8945]/80 hover:text-white transition-all"
              >
                {option.label}
                {value?.value === option.value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

const OilCollectionSchedulingPage = () => {
  const triggerNotification = useNotification();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [branchesId, setBranchesId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [paymentTypeId, setPaymentTypeId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState(""); // New state for editable unit price
  const [totalAmount, setTotalAmount] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("AED"); // Default to AED for SSR

  // Fetch currency from cookies on client side
  useEffect(() => {
    const cookieCurrency = Cookies.get("currency") || "AED";
    setCurrency(cookieCurrency);
  }, []);

  // Hardcoded exchange rates (AED as base)
  const exchangeRates = {
    AED: 1,
    USD: 0.27, // 1 AED ≈ 0.27 USD
    EUR: 0.25, // 1 AED ≈ 0.25 EUR
  };

  // Convert AED to other currencies
  const convertPrice = (valueInAED) => {
    if (!valueInAED || isNaN(valueInAED)) return { USD: "N/A", EUR: "N/A" };
    return {
      USD: (valueInAED * exchangeRates.USD).toFixed(2),
      EUR: (valueInAED * exchangeRates.EUR).toFixed(2),
    };
  };

  // Fetch data function adjusted for API response structure
  const fetchData = async (endpoint, mapFn) => {
    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("Authentication token missing!", "error");
      return [];
    }
    try {
      const response = await axios.get(`${apiUrl}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (response.data.data || response.data).map(mapFn);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      triggerNotification(`Failed to fetch ${endpoint} data!`, "error");
      return [];
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setDrivers(await fetchData("drivers", (driver) => ({
        label: `${driver.first_name} ${driver.last_name || ""}`.trim(),
        value: driver.id,
      })));
      setCompanies(await fetchData("companies", (area) => ({
        label: area.name,
        value: area.id,
        contract_end_at: area.contract_end_at
          ? new Date(area.contract_end_at).toISOString().split("T")[0].split("-").reverse().join("/")
          : "",
        unit_price: area.unit_price || "",
      })));
      setPaymentTypes(await fetchData("payment_types", (area) => ({
        label: area.payment_type,
        value: area.id,
      })));
    };
    loadInitialData();
  }, []);

  // Fetch vehicles when driver changes
  useEffect(() => {
    if (selectedDriverId?.value) {
      fetchData(`drivers/${selectedDriverId.value}/vehicles`, (vehicle) => ({
        label: vehicle.vehicle_number,
        value: vehicle.id,
      })).then(setVehicles);
    } else {
      setVehicles([]);
      setSelectedVehicleId(null);
    }
  }, [selectedDriverId]);

  // Fetch branches and set unit price when company changes
  useEffect(() => {
    if (companyId?.value) {
      fetchData(`get_company_branches/${companyId.value}`, (branch) => ({
        label: branch.branch_name,
        value: branch.id,
      })).then(setBranches);
      setUnitPrice(companyId.unit_price || ""); // Pre-fill unit price from selected company
    } else {
      setBranches([]);
      setBranchesId(null);
      setUnitPrice(""); // Reset unit price if no company selected
    }
  }, [companyId]);

  // Calculate total amount whenever quantity or unit price changes
  useEffect(() => {
    const amountInAED = quantity * (unitPrice || 0);
    setTotalAmount(amountInAED > 0 ? amountInAED.toFixed(2) : "");
  }, [quantity, unitPrice]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    setQuantity(newQuantity);
  };

  // Handle unit price change
  const handleUnitPriceChange = (e) => {
    const newUnitPrice = e.target.value;
    setUnitPrice(newUnitPrice);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("No authentication token found!", "error");
      setLoading(false);
      return;
    }

    if (!branchesId) {
      triggerNotification("Please select company branch!", "warning");
      setLoading(false);
      return;
    }

    if (!quantity || quantity <= 0) {
      triggerNotification("Quantity must be a positive number!", "warning");
      setLoading(false);
      return;
    }

    if (!unitPrice || unitPrice <= 0) {
      triggerNotification("Unit price must be a positive number!", "warning");
      setLoading(false);
      return;
    }

    const requestData = {
      driver_id: selectedDriverId?.value,
      vehicle_id: selectedVehicleId?.value,
      quantity: parseFloat(quantity),
      price: parseFloat(totalAmount), // Total amount in AED
      status: selectedStatus?.value,
      payment_type_id: paymentTypeId?.value,
      day: selectedDay?.value,
      company_branch_id: branchesId?.value,
    };

    const missingFields = Object.entries(requestData)
      .filter(([_, value]) => value === null || value === undefined || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      triggerNotification(`Please fill the required fields: ${missingFields.join(", ")}`, "warning");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/oil_collections`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201 || response.status === 200) {
        triggerNotification("Oil collection scheduled successfully!", "success");
        window.location.href = "/admin/oilCollectionScheduling";
      } else {
        triggerNotification("Unexpected response from server!", "error");
      }
    } catch (error) {
      triggerNotification(
        error.response?.data?.message || "Failed to submit data, check your network!",
        "error"
      );
      console.error("Submission error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // Convert unit price and total amount for display
  const unitPriceConversions = convertPrice(parseFloat(unitPrice) || 0);
  const totalAmountConversions = convertPrice(parseFloat(totalAmount) || 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="p-6 rounded-sm w-full bg-white">
        <h2 className="text-2xl font-semibold text-gray-700 mb-5">
          Add Oil Scheduling Collection
        </h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <CustomDropdown
            value={selectedDriverId}
            label="Driver"
            options={drivers}
            onSelect={setSelectedDriverId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={selectedVehicleId}
            label="Vehicle"
            options={vehicles}
            onSelect={setSelectedVehicleId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={selectedDay}
            label="Day"
            options={[
              { label: "Sunday", value: "sunday" },
              { label: "Monday", value: "monday" },
              { label: "Tuesday", value: "tuesday" },
              { label: "Wednesday", value: "wednesday" },
              { label: "Thursday", value: "thursday" },
              { label: "Friday", value: "friday" },
              { label: "Saturday", value: "saturday" },
            ]}
            onSelect={setSelectedDay}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={companyId}
            label="Companies"
            options={companies}
            onSelect={setCompanyId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={branchesId}
            label="Company Branches"
            options={branches}
            onSelect={setBranchesId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contract Expiry Date
            </label>
            <input
              value={companyId?.contract_end_at || ""}
              readOnly
              type="text"
              className="input bg-gray-200 w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Unit Price (AED)
            </label>
            <input
              value={unitPrice}
              type="number"
              min="0"
              step="0.01" // Allows decimal values
              onChange={handleUnitPriceChange}
              className="input w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter unit price"
            />
            {currency !== "AED" && unitPrice > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span>USD {unitPriceConversions.USD} </span>
                <span>EUR {unitPriceConversions.EUR}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handleQuantityChange}
              className="input w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Total Amount (AED)
            </label>
            <input
              value={totalAmount ? `${totalAmount} AED` : ""}
              readOnly
              type="text"
              className="input bg-gray-200 w-full p-3 border border-gray-300 rounded-lg"
            />
            {currency !== "AED" && totalAmount > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span>USD {totalAmountConversions.USD} </span>
                <span>EUR {totalAmountConversions.EUR}</span>
              </div>
            )}
          </div>
          <CustomDropdown
            value={paymentTypeId}
            label="Payment Type"
            options={paymentTypes}
            onSelect={setPaymentTypeId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={selectedStatus}
            label="Status"
            options={[
              { label: "Processing", value: "processing" },
              { label: "Collected", value: "collected" },
            ]}
            onSelect={setSelectedStatus}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-fit bg-[#de8945] text-white py-2 px-10 font-semibold rounded-md hover:bg-[#de8945]/90 transition-all disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OilCollectionSchedulingPage;
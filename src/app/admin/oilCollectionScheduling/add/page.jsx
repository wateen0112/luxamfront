"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNotification } from "../../../../components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Currency conversion function
const convertCurrency = (aedValue) => {
  const exchangeRates = {
    USD: 0.2723, // 1 AED = 0.2723 USD
    EUR: 0.2510, // 1 AED = 0.2510 EUR
    AED: 1,      // 1 AED = 1 AED (no conversion)
  };

  const currentCurrency = Cookies.get("currency") || "AED";
  const convertedValue = aedValue && !isNaN(aedValue)
    ? (aedValue * exchangeRates[currentCurrency]).toFixed(2)
    : 0;

  return {
    convertedValue,
    currentCurrency,
  };
};

// CustomDropdown component (minimized hooks usage but kept functional)
const CustomDropdown = ({
  label,
  options,
  onSelect,
  openDropdown,
  setOpenDropdown,
  isMultiSelect = false,
  value,
}) => {
  const isOpen = openDropdown === label;

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpenDropdown(isOpen ? null : label);
  };

  const handleSelect = (option) => {
    if (isMultiSelect) {
      onSelect((prevSelected) => {
        const selectedArray = prevSelected || [];
        return selectedArray.some((item) => item.value === option.value)
          ? selectedArray.filter((item) => item.value !== option.value)
          : [...selectedArray, option];
      });
    } else {
      onSelect(option);
      setOpenDropdown(null);
    }
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
          {isMultiSelect
            ? value?.length > 0
              ? value.map((item) => item.label).join(", ")
              : `Select ${label}`
            : value?.label || `Select ${label}`}

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
                {(isMultiSelect
                  ? value?.some((item) => item.value === option.value)
                  : value?.value === option.value) && (
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

// Main function to handle all logic and rendering
const renderOilCollectionScheduling = async (setPage = null) => {
  let drivers = [];
  let vehicles = [];
  let branches = [];
  let companies = [];
  let paymentTypes = [];
  let selectedDriverId = null;
  let selectedVehicleId = null;
  let branchesId = null;
  let companyId = null;
  let paymentTypeId = null;
  let selectedDay = null;
  let selectedStatus = null;
  let quantity = "";
  let totalAmount = "";
  let openDropdown = null;

  const triggerNotification = useNotification();
  const router = { push: (path) => window.location.href = path }; // Mock router for non-hook context

  const fetchData = async (endpoint, mapFn) => {
    const token = Cookies.get("luxamToken");
    try {
      const response = await axios.get(`${apiUrl}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data.map(mapFn);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };

  // Fetch all initial data
  drivers = await fetchData("drivers", (driver) => ({
    label: driver.name,
    value: driver.id,
  }));

  if (selectedDriverId?.value) {
    vehicles = await fetchData(`drivers/${selectedDriverId.value}/vehicles`, (vehicle) => ({
      label: vehicle.vehicle_number,
      value: vehicle.id,
    }));
  }

  companies = await fetchData("companies", (area) => ({
    label: area.name,
    value: area.id,
    contract_end_at: area.contract_end_at
      ? new Date(area.contract_end_at).toISOString().split("T")[0].split("-").reverse().join("/")
      : "",
    unit_price: area.unit_price || "",
  }));

  if (companyId?.value) {
    branches = await fetchData(`get_company_branches/${companyId.value}`, (branch) => ({
      label: branch.branch_name,
      value: branch.id,
    }));
  }

  paymentTypes = await fetchData("payment_types", (area) => ({
    label: area.payment_type,
    value: area.id,
  }));

  const handleChange = (e) => {
    quantity = e.target.value;
    const amount = quantity * (companyId?.unit_price || 0);
    const { convertedValue: convertedAmount, currentCurrency } = convertCurrency(amount);
    totalAmount = `${convertedAmount} ${currentCurrency}`;
    renderPage(); // Re-render with updated values
  };

  const handleSubmit = async () => {
    const token = Cookies.get("luxamToken");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    if (!branchesId) {
      triggerNotification("يرجى اختيار الفروع قبل الإرسال!", "warning");
      return;
    }

    if (quantity < 0) {
      triggerNotification("Quantity cannot be negative", "warning");
      return;
    }

    const requestData = {
      driver_id: selectedDriverId?.value,
      vehicle_id: selectedVehicleId?.value,
      quantity: quantity,
      price: convertCurrency(totalAmount.split(" ")[0]).convertedValue, // Convert back to AED if needed
      status: selectedStatus?.value,
      payment_type_id: paymentTypeId?.value,
      day: selectedDay?.value,
      company_branch_id: branchesId?.value,
    };

    const missingFields = Object.entries(requestData)
      .filter(([_, value]) => value === "" || value === null || value === undefined)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      triggerNotification(`يرجى ملء جميع الحقول قبل الإرسال!`, "warning");
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
        router.push("/admin/oilCollectionScheduling");
      } else {
        triggerNotification("حدث خطأ أثناء إرسال البيانات!", "error");
      }
    } catch (error) {
      triggerNotification("فشل في إرسال البيانات، تحقق من الاتصال بالإنترنت!", "error");
    }
  };

  const renderPage = () => {
    const { convertedValue: unitPriceConverted, currentCurrency } = convertCurrency(companyId?.unit_price || 0);
    const { convertedValue: totalAmountConverted } = convertCurrency(quantity * (companyId?.unit_price || 0));

    totalAmount = quantity ? `${totalAmountConverted} ${currentCurrency}` : "";

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
              onSelect={(option) => { selectedDriverId = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <CustomDropdown
              value={selectedVehicleId}
              label="Vehicle"
              options={vehicles}
              onSelect={(option) => { selectedVehicleId = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
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
              onSelect={(option) => { selectedDay = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <CustomDropdown
              value={companyId}
              label="Companies"
              options={companies}
              onSelect={(option) => { companyId = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <CustomDropdown
              value={branchesId}
              label="Company Branches"
              options={branches}
              onSelect={(option) => { branchesId = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Contract expiry date
              </label>
              <input
                value={companyId?.contract_end_at || ""}
                readOnly
                type="text"
                className="input bg-gray-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Unit price
              </label>
              <input
                value={companyId ? `${unitPriceConverted} ${currentCurrency}` : ""}
                type="text"
                className="input bg-gray-200"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Total amount
              </label>
              <input
                value={totalAmount}
                readOnly
                type="text"
                className="input bg-gray-200"
              />
            </div>
            <CustomDropdown
              value={paymentTypeId}
              label="Payment Type"
              options={paymentTypes}
              onSelect={(option) => { paymentTypeId = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <CustomDropdown
              value={selectedStatus}
              label="Status"
              options={[
                { label: "Processing", value: "processing" },
                { label: "Collected", value: "collected" },
              ]}
              onSelect={(option) => { selectedStatus = option; renderPage(); }}
              openDropdown={openDropdown}
              setOpenDropdown={(val) => { openDropdown = val; renderPage(); }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-fit bg-[#de8945] text-white py-2 px-10 font-semibold rounded-md hover:bg-[#de8945]/90 transition-all"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  };

  const content = renderPage();
  setPage(content);
};

// Wrapper component to trigger the initial render
const Page = () => {
  const [pageContent, setPageContent] = React.useState(null);

  const setPage = (content) => {
    setPageContent(content);
  };

  // Initial render
  if (!pageContent) {
    renderOilCollectionScheduling(setPage);
  }

  return pageContent;
};

export default Page;
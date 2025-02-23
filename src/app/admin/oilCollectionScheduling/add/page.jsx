"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import MapSchedules from "@/components/schedules/MapSchedules";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const [selected, setSelected] = useState(isMultiSelect ? [] : null);
  const [direction, setDirection] = useState("down");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelected(value); // تحديث القيمة عند تغيير الـ prop
  }, [value]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setDirection("up");
      } else {
        setDirection("down");
      }
    }
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpenDropdown(isOpen ? null : label);
  };

  const handleSelect = (option) => {
    if (isMultiSelect) {
      setSelected((prevSelected) => {
        const selectedArray = prevSelected || [];
        return selectedArray.some((item) => item.value === option.value)
          ? selectedArray.filter((item) => item.value !== option.value)
          : [...selectedArray, option];
      });

      onSelect((prevSelected) => {
        const selectedArray = prevSelected || [];
        return selectedArray.some((item) => item.value === option.value)
          ? selectedArray.filter((item) => item.value !== option.value)
          : [...selectedArray, option];
      });
    } else {
      setSelected(option);
      onSelect(option);
      setOpenDropdown(null);
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="block text-gray-700 font-medium mb-1">{label} *</label>
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center bg-white transition-all"
        >
          {isMultiSelect
            ? selected?.length > 0
              ? selected.map((item) => item.label).join(", ")
              : `Select ${label}`
            : selected?.label
            ? selected.label
            : value
            ? value
            : `Select ${label}`}

          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: direction === "down" ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === "down" ? -10 : 10 }}
            className={`absolute w-full max-h-[250px] hide-scrollbar overflow-y-auto bg-white border border-gray-300 rounded-lg z-10 overflow-hidden ${
              direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#de8945]/80 hover:text-white transition-all"
              >
                {option.label}
                {(isMultiSelect
                  ? selected?.some((item) => item.value === option.value)
                  : selected?.value === option.value) && (
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

const Page = () => {
  const triggerNotification = useNotification();

  const router = useRouter();

  const [coordinates, setCoordinates] = useState({
    latitude: 25.2048,
    longitude: 55.2708,
  });
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicle, setVehicles] = useState([]);

  const [branches, setBranches] = useState([]);
  const [branchesId, setBranchesId] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  const [paymentType, setPaymentType] = useState([]);
  const [paymentTypeId, setPaymentTypeId] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const handleChange = (e) => {
    setQuantity(e.target.value);
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const driverOptions = response.data.data.map((driver) => ({
          label: driver.name,
          value: driver.id,
        }));

        setDrivers(driverOptions);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(
          `${apiUrl}/drivers/${selectedDriverId?.value}/vehicles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const vehicle = response.data.map((vehicle) => ({
          label: vehicle.vehicle_number,
          value: vehicle.id,
        }));
        setVehicles(vehicle);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchVehicles();
  }, [selectedDriverId?.value]);

  useEffect(() => {
    const fetchBranches = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(
          `${apiUrl}/get_company_branches/${companyId?.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const branch = response.data.map((branch) => ({
          label: branch.branch_name,
          value: branch.id,
        }));
        setBranches(branch);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchBranches();
  }, [companyId?.value]);

  useEffect(() => {
    const fetchArea = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const companies = response.data.data.map((area) => ({
          label: area.name,
          value: area.id,
          contract_end_at: area.contract_end_at
            ? new Date(area.contract_end_at)
                .toISOString()
                .split("T")[0]
                .split("-")
                .reverse()
                .join("/")
            : "",
          unit_price: area.unit_price || "",
        }));

        setCompanies(companies);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchArea();
  }, []);

  useEffect(() => {
    const fetchArea = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/payment_types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const companies = response.data.data.map((area) => ({
          label: area.payment_type,
          value: area.id,
        }));
        setPaymentType(companies);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchArea();
  }, []);

  const handleSubmit = async () => {
    const token = Cookies.get("luxamToken");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }
  
    if (!branchesId || branchesId.length === 0) {
      triggerNotification("يرجى اختيار الفروع قبل الإرسال!", "warning");
      return;
    }
  
    // **منع القيم السالبة في quantity**
    if (quantity < 0) {
      triggerNotification("Quantity cannot be negative", "warning");
      return;
    }
  
    const requestData = {
      driver_id: selectedDriverId?.value,
      vehicle_id: selectedVehicleId?.value,
      quantity: quantity,
      price: totalAmount,
      status: selectedStatus?.value,
      payment_type_id: paymentTypeId?.value,
      day: selectedDay?.value,
      company_branch_id: branchesId?.value,
    };
  
    console.log(requestData);
  
    // **التحقق من الحقول الفارغة**
    const missingFields = Object.entries(requestData)
      .filter(
        ([key, value]) => value === "" || value === null || value === undefined
      )
      .map(([key]) => key);
  
    if (missingFields.length > 0) {
      triggerNotification(`يرجى ملء جميع الحقول قبل الإرسال!  `, "warning");
      return;
    }
  
    try {
      const response = await axios.post(
        `${apiUrl}/oil_collections`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log(response);
      if (response.status === 201 || response.status === 200) {
        router.push("/admin/oilCollectionScheduling");
      } else {
        console.error("Unexpected response:", response);
        triggerNotification("حدث خطأ أثناء إرسال البيانات!", "error");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      triggerNotification(
        "فشل في إرسال البيانات، تحقق من الاتصال بالإنترنت!",
        "error"
      );
    }
  };
  

  useEffect(() => {
    const amount = quantity * (companyId?.unit_price || 0);
    setTotalAmount(amount);
  }, [quantity, companyId?.value]);

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
            onSelect={(option) => setSelectedDriverId(option)}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={selectedVehicleId}
            label="Vehicle"
            options={vehicle}
            onSelect={setSelectedVehicleId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            value={selectedDay} // تحديد القيمة المختارة من الـ state
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
            <label className="block text-gray-700 font-medium mb-1" htmlFor="">
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
            <label className="block text-gray-700 font-medium mb-1" htmlFor="">
              Unit price
            </label>
            <input
              value={companyId?.unit_price || ""}
              type="number"
              min={1}
              className="input bg-gray-200"
              readOnly
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="">
              Quantity 
            </label>
            <input type="number" min={1} className="input" onChange={handleChange} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="">
              Total amount 
            </label>
            <input
              value={totalAmount}
              readOnly
              type="number"
              min={1}
              className="input bg-gray-200"
            />
          </div>

          <CustomDropdown
            value={paymentTypeId}
            label="Payment Type"
            options={paymentType}
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
            className="w-fit bg-[#de8945] text-white py-2 px-10 font-semibold rounded-md hover:bg-[#de8945]/90 transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;

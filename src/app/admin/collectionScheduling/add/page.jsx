"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import MapSchedules from "../../../../components/schedules/MapSchedules";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useNotification } from "../../../../components/notifi/NotificationContext";


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const CustomDropdown = ({
  label,
  options,
  onSelect,
  openDropdown,
  setOpenDropdown,
  isMultiSelect = false,
}) => {
  const isOpen = openDropdown === label;
  const [selected, setSelected] = useState(isMultiSelect ? [] : null);
  const [direction, setDirection] = useState("down");
  const dropdownRef = useRef(null);
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
        onSelect(option.value);
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
            ? selected.length > 0
            ? selected.map((item) => item.label).join(", ")
            : `Select ${label}`
            : selected?.label || `Select ${label}`}
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
                  ? selected.some((item) => item.value === option.value)
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
  const router = useRouter();
  
  const [coordinates, setCoordinates] = useState({
    latitude: 25.2048,
    longitude: 55.2708,
  });
  const triggerNotification = useNotification()
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicle, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchesId, setBranchesId] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesId, setCitiesId] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

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
          `${apiUrl}/drivers/${selectedDriverId}/vehicles`,
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
  }, [selectedDriverId]);

  useEffect(() => {
    const fetchBranches = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/get_near_branches`, {
          params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [coordinates]);

  useEffect(() => {
    const fetchCities = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const cities = response.data.data.data.map((city) => ({
          label: city.name,
          value: city.id,
        }));
        setCities(cities);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchArea = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/cities/${citiesId}/areas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const areas = response.data.areas.map((area) => ({
          label: area.name,
          value: area.name,
        }));
        setAreas(areas);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchArea();
  }, [citiesId]);

  const handleSubmit = async () => {
    const token = Cookies.get("luxamToken");
    if (!token) {
      console.error("No authentication token found!");
      return;
    }

    if (!branchesId || branchesId.length === 0) {
      triggerNotification("Please select a branch", "warning")
      // alert("Please select a branch");
      return;
    }

    const requestData = {
      driver_id: selectedDriverId,
      vehicle_id: selectedVehicleId,
      companies_branches: branchesId.map((branch) => branch.value),
      area: areaId,
      day: selectedDay,
      status: selectedStatus,
    };
    if (
      Object.values(requestData).some(
        (value) => value === "" || value === null || value === undefined
      )
    ) {
      triggerNotification("Please fill the required fields !", "warning")
      // alert("Please fill the required fields !");
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/schedules`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 201 || response.status === 200) {
        router.push("/admin/collectionScheduling");
      } else {
        console.error("Unexpected response:", response);
        triggerNotification("حدث خطأ أثناء إرسال البيانات!", "error")
        // alert("حدث خطأ أثناء إرسال البيانات!");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      triggerNotification("فشل في إرسال البيانات، تحقق من الاتصال بالإنترنت!", "error")
      // alert("فشل في إرسال البيانات، تحقق من الاتصال بالإنترنت!");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="p-6 rounded-sm w-full bg-white">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Add Scheduling
        </h2>
        <MapSchedules setCoordinates={setCoordinates} />
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <CustomDropdown
            label="Driver"
            options={drivers}
            onSelect={setSelectedDriverId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            label="Vehicle"
            options={vehicle}
            onSelect={setSelectedVehicleId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            label="Company Branches"
            options={branches}
            onSelect={setBranchesId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            isMultiSelect
          />
          <CustomDropdown
            label="City"
            options={cities}
            onSelect={setCitiesId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
            label="Area"
            options={areas}
            onSelect={setAreaId}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
          <CustomDropdown
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
            label="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
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

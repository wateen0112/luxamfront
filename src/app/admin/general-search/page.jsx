"use client";
import {
  FaTruck,
  FaUserTie,
  FaBuilding,
  FaCodeBranch,
  FaWallet,
  FaCheckCircle,
  FaCalendarAlt,
  FaRegCalendarCheck,
  FaPlayCircle,
  FaStopCircle,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import General from "../../../components/generalSearch/General";
import axios from "axios";
import Cookies from "js-cookie";
import { useNotification } from "../../../components/notifi/NotificationContext";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  // Dynamic year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear + 5 - 2000 + 1 },
    (_, i) => ({
      id: (2000 + i).toString(),
      value: (2000 + i).toString(),
    })
  );

  // General Search Section
  const generalSearchTitle = "General Search";

  const driverInput = {
    name: "driver",
    label: "Driver",
    placeholder: "Select Driver",
    icon: FaUserTie,
    options: [],
  };

  const vehicleInput = {
    name: "vehicle",
    label: "Vehicle",
    placeholder: "Select Vehicle",
    icon: FaTruck,
    options: [],
  };

  const companyInput = {
    name: "company",
    label: "Company",
    placeholder: "Select Company",
    icon: FaBuilding,
    options: [],
  };

  const branchInput = {
    name: "branch",
    label: "Branch",
    placeholder: "Select Branch",
    icon: FaCodeBranch,
    options: [],
  };

  const paymentTypeInput = {
    name: "payment_type",
    label: "Payment Type",
    placeholder: "Select Payment Type",
    icon: FaWallet,
    options: [],
  };

  const collectionStatusInput = {
    name: "collection_status",
    label: "Collection Status",
    placeholder: "Select Collection Status",
    icon: FaCheckCircle,
    options: [
      { id: "processing", value: "Processing" },
      { id: "out_for_collection", value: "Out For collection" },
      { id: "collected", value: "Collected" },
      { id: "canceled_by_user", value: "Canceled By User" },
      { id: "canceled_by_admin", value: "Canceled By Admin" },
    ],
  };

  const collectedDateInput = {
    name: "collected_date",
    label: "Collected Date",
    placeholder: "Select Date",
    icon: FaRegCalendarCheck,
    options: ["2025-01-01", "2025-02-01"],
  };

  const collectionStartDateInput = {
    name: "collection_start_date",
    label: "Collection Start Date",
    placeholder: "Start Date",
    icon: FaPlayCircle,
    options: ["2025-01-01", "2025-02-01"],
  };

  const collectionEndDateInput = {
    name: "collection_end_date",
    label: "Collection End Date",
    placeholder: "End Date",
    icon: FaStopCircle,
    options: ["2025-01-01", "2025-02-01"],
  };

  // Search Collection on a Particular Year Section
  const yearSearchTitle = "Search Collection on a particular Year";

  const yearInput = {
    name: "year",
    label: "Year",
    placeholder: "Select Year",
    icon: FaCalendarAlt,
    options: yearOptions,
  };

  // Search Total Verified Collection Section
  const verifiedSearchTitle = "Search Total Verified Collection";

  const verifiedDriverInput = {
    name: "verified_driver",
    label: "Driver",
    placeholder: "Select Driver",
    icon: FaUserTie,
    options: [],
  };

  const verifiedStartDateInput = {
    name: "verified_start_date",
    label: "Verified Collection Start Date",
    placeholder: "Start Date",
    icon: FaPlayCircle,
    options: ["2025-01-01", "2025-02-01"],
  };

  const verifiedEndDateInput = {
    name: "verified_end_date",
    label: "Verified Collection End Date",
    placeholder: "End Date",
    icon: FaStopCircle,
    options: ["2025-01-01", "2025-02-01"],
  };

  const router = useRouter();
  const triggerNotification = useNotification();

  const [selected, setSelected] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [paymentType, setPaymentType] = useState([]);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setDrivers(response.data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = Cookies.get("luxamToken");
        if (!token) throw new Error("Token not found");

        const id = selected?.driver?.id;
        const url = id
          ? `${apiUrl}/get_vehicle_drivers/${id}`
          : `${apiUrl}/get_vehicles`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setVehicles(response?.data?.vehicles || response?.data?.data);
      } catch (error) {
        triggerNotification(error?.response?.data?.message, "warning");
      }
    };
    fetchVehicles();
  }, [selected?.driver?.id]);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = Cookies.get("luxamToken");
        if (!token) throw new Error("Token not found");

        const id = selected?.company?.id;
        const url = id
          ? `${apiUrl}/get_company_branches/${id}`
          : `${apiUrl}/company-branches`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setBranches(response?.data.data || response?.data);
      } catch (error) {
        triggerNotification(error?.response?.data?.message, "warning");
      }
    };
    fetchBranches();
  }, [selected?.company?.id]);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchPayment = async () => {
      try {
        const response = await axios.get(`${apiUrl}/payment_types`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setPaymentType(response.data.data);
      } catch (error) {
        console.error("Error fetching payment types:", error);
      }
    };
    fetchPayment();
  }, []);

  const handleGeneralSearch = async (e) => {
    e.preventDefault();

    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("Authentication token is missing.", "error");
      return;
    }

    const startDate = selected?.collection_start_date?.value;
    const endDate = selected?.collection_end_date?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      triggerNotification(
        "Start date cannot be after the end date.",
        "warning"
      );
      return;
    }

    const requestData = {
      collected_at: selected?.collected_date?.value,
      vehicle_id: selected?.vehicle?.id,
      driver_id: selected?.driver?.id,
      company_id: selected?.company?.id,
      company_branch_id: selected?.branch?.id,
      status: selected?.collection_status?.id,
      payment_type_id: selected?.payment_type?.id,
      start_date: startDate,
      end_date: endDate,
    };

    const filteredRequestData = Object.fromEntries(
      Object.entries(requestData).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    if (Object.keys(filteredRequestData).length === 0) {
      triggerNotification("At least one field must be filled.", "error");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/general-search`, {
        params: filteredRequestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data) {
        localStorage.removeItem("searchResults");
        localStorage.setItem("searchResults", JSON.stringify(response.data));
        triggerNotification("Data fetched successfully!", "success");
        router.push("/admin/tableGeneralSearch");
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
    }
  };

  const handleYearSearch = async (e) => {
    e.preventDefault();

    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("Authentication token is missing.", "error");
      return;
    }

    const year = selected?.year?.value;

    if (!year) {
      triggerNotification("Please select a year.", "error");
      return;
    }

    const requestData = {
      year: year,
    };

    try {
      const response = await axios.get(`${apiUrl}/general-search-by-year`, {
        params: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data) {
        localStorage.removeItem("searchResults");
        localStorage.setItem("searchResults", JSON.stringify(response.data));
        triggerNotification("Data fetched successfully!", "success");
        router.push("/admin/tableGeneralSearch");
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
    }
  };

  const handleVerifiedCollectionSearch = async (e) => {
    e.preventDefault();

    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("Authentication token is missing.", "error");
      return;
    }

    const startDate = selected?.verified_start_date?.value;
    const endDate = selected?.verified_end_date?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      triggerNotification(
        "Start date cannot be after the end date.",
        "warning"
      );
      return;
    }

    const driverId = selected?.verified_driver?.id;

    if (!driverId) {
      triggerNotification("Driver field is required.", "error");
      return;
    }

    const requestData = {
      driver_id: driverId,
      start_date: startDate,
      end_date: endDate,
    };

    const filteredRequestData = Object.fromEntries(
      Object.entries(requestData).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    if (Object.keys(filteredRequestData).length === 0) {
      triggerNotification("At least one field must be filled.", "error");
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/general-search-by-driver-and-date`,
        {
          params: filteredRequestData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response?.data) {
        localStorage.removeItem("searchResults");
        localStorage.setItem("searchResults", JSON.stringify(response.data));
        triggerNotification("Data fetched successfully!", "success");
        router.push("/admin/tableGeneralSearch");
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
    }
  };

  // Update options for each input individually
  driverInput.options =
    drivers.length > 0
      ? drivers.map((driver) => ({
          id: driver.id,
          value: `${driver.first_name} ${driver.last_name}`,
        }))
      : [];
  vehicleInput.options =
    vehicles.length > 0
      ? vehicles.map((vehicle) => ({
          id: vehicle.id,
          value: vehicle?.vehicle_number,
        }))
      : [];
  companyInput.options =
    companies.length > 0
      ? companies.map((company) => ({
          id: company.id,
          value: company?.name,
        }))
      : [];
  branchInput.options =
    branches.length > 0
      ? branches.map((branch) => ({
          id: branch.id,
          value: branch?.branch_name,
        }))
      : [];
  paymentTypeInput.options =
    paymentType.length > 0
      ? paymentType.map((payment) => ({
          id: payment.id,
          value: payment?.payment_type,
        }))
      : [];
  verifiedDriverInput.options =
    drivers.length > 0
      ? drivers.map((driver) => ({
          id: driver.id,
          value: `${driver.first_name} ${driver.last_name}`,
        }))
      : [];

  return (
    <div className="py-5 px-3 sm:px-7">
      <General
        title={generalSearchTitle}
        inputs={[
          driverInput,
          vehicleInput,
          companyInput,
          branchInput,
          paymentTypeInput,
          collectionStatusInput,
          collectedDateInput,
          collectionStartDateInput,
          collectionEndDateInput,
        ]}
        setSelected={setSelected}
        handleSubmitSectionOne={handleGeneralSearch}
      />
      <General
        title={yearSearchTitle}
        inputs={[yearInput]}
        setSelected={setSelected}
        handleSubmitSectionTwo={handleYearSearch}
      />
      <General
        title={verifiedSearchTitle}
        inputs={[verifiedDriverInput, verifiedStartDateInput, verifiedEndDateInput]}
        setSelected={setSelected}
        handleSubmitSectionThree={handleVerifiedCollectionSearch}
      />
    </div>
  );
};

export default Page;
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
  const sections = [
    {
      title: "General Search",
      inputs: [
        {
          name: "driver",
          label: "Driver",
          placeholder: "Select Driver",
          icon: FaUserTie,
          options: [],
        },
        {
          name: "vehicle",
          label: "Vehicle",
          placeholder: "Select Vehicle",
          icon: FaTruck,
          options: [],
        },
        {
          name: "company",
          label: "Company",
          placeholder: "Select Company",
          icon: FaBuilding,
          options: [],
        },
        {
          name: "branch",
          label: "Branch",
          placeholder: "Select Branch",
          icon: FaCodeBranch,
          options: [],
        },
        {
          name: "payment_type",
          label: "Payment Type",
          placeholder: "Select Payment Type",
          icon: FaWallet,
          options: [],
        },
        {
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
        },
        {
          name: "collected_date",
          label: "Collected Date",
          placeholder: "Select Date",
          icon: FaRegCalendarCheck,
          options: ["2025-01-01", "2025-02-01"],
        },
        {
          name: "collection_start_date",
          label: "Collection Start Date",
          placeholder: "Start Date",
          icon: FaPlayCircle,
          options: ["2025-01-01", "2025-02-01"],
        },
        {
          name: "collection_end_date",
          label: "Collection End Date",
          placeholder: "End Date",
          icon: FaStopCircle,
          options: ["2025-01-01", "2025-02-01"],
        },
      ],
    },
    {
      title: "Search Collection on a particular Year",
      inputs: [
        {
          name: "year",
          label: "Year",
          placeholder: "Select Year",
          icon: FaCalendarAlt,
          options: ["2025", "2026", "2027"],
        },
      ],
    },
    {
      title: "Search Total Verified Collection",
      inputs: [
        {
          name: "verified_driver",
          label: "Driver",
          placeholder: "Select Driver",
          icon: FaUserTie,
          options: [],
        },
        {
          name: "verified_start_date",
          label: "Verified Collection Start Date",
          placeholder: "Start Date",
          icon: FaPlayCircle,
          options: ["2025-01-01", "2025-02-01"],
        },
        {
          name: "verified_end_date",
          label: " Verified Collection End Date",
          placeholder: "End Date",
          icon: FaStopCircle,
          options: ["2025-01-01", "2025-02-01"],
        },
      ],
    },
  ];
  const router = useRouter();
  const triggerNotification = useNotification();

  const [selected, setSelected] = useState([]);
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
        console.log(response);
        setVehicles(response?.data?.vehicles || response?.data?.data);
      } catch (error) {
        triggerNotification(error?.response?.data?.message, "warning");
        // console.error("Error fetching vehicles:", error);
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
        console.error("Error fetching drivers:", error);
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
        console.error("Error fetching vehicles:", error);
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
        console.error("Error fetching drivers:", error);
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

    if (new Date(startDate) > new Date(endDate)) {
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

    console.log("Request Params:", filteredRequestData);

    try {
      const response = await axios.get(`${apiUrl}/general-search`, {
        params: filteredRequestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response?.data) {
        // حذف البيانات القديمة من localStorage
        localStorage.removeItem("searchResults");

        // تخزين البيانات الجديدة
        localStorage.setItem("searchResults", JSON.stringify(response.data));

        triggerNotification("Data fetched successfully!", "success");

        // التوجيه بعد التخزين الناجح
        router.push("/admin/tableGeneralSearch"); // لـ Next.js
        // navigate("/new-page"); // لـ React Router
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
      console.log(err);
    }
  };

  const handleYearSearch = async (e) => {
    e.preventDefault();

    const token = Cookies.get("luxamToken");
    if (!token) {
      triggerNotification("Authentication token is missing.", "error");
      return;
    }

    // استخراج السنة فقط من القيمة
    const year = selected?.year?.value?.split("-")[0]; // فصل السنة عن الشهر واليوم

    const requestData = {
      year: year, // إرسال السنة فقط
    };

    // الفلترة لضمان أن السنة ليست فارغة أو غير معرّفة
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
      console.log("Request Params:", filteredRequestData);
      const response = await axios.get(`${apiUrl}/general-search-by-year`, {
        params: filteredRequestData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (response?.data) {
        // حذف البيانات القديمة من localStorage
        localStorage.removeItem("searchResults");

        // تخزين البيانات الجديدة
        localStorage.setItem("searchResults", JSON.stringify(response.data));

        triggerNotification("Data fetched successfully!", "success");

        // التوجيه بعد التخزين الناجح
        router.push("/admin/tableGeneralSearch"); // لـ Next.js
        // navigate("/new-page"); // لـ React Router
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
      console.log(err);
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

    // التأكد من أن تاريخ البدء لا يتجاوز تاريخ الانتهاء
    if (new Date(startDate) > new Date(endDate)) {
      triggerNotification(
        "Start date cannot be after the end date.",
        "warning"
      );
      return;
    }

    const driverId = selected?.verified_driver?.id;

    // التحقق من أن حقل الدرايفر موجود
    if (!driverId) {
      triggerNotification("Driver field is required.", "error");
      return;
    }

    // تجميع البيانات المطلوبة للبحث
    const requestData = {
      driver_id: driverId,
      start_date: startDate,
      end_date: endDate,
    };

    // تصفية البيانات لإزالة القيم الفارغة
    const filteredRequestData = Object.fromEntries(
      Object.entries(requestData).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    if (Object.keys(filteredRequestData).length === 0) {
      triggerNotification("At least one field must be filled.", "error");
      return;
    }

    console.log("Request Params:", filteredRequestData);

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
      console.log(response);
      if (response?.data) {
        // حذف البيانات القديمة من localStorage
        localStorage.removeItem("searchResults");

        // تخزين البيانات الجديدة
        localStorage.setItem("searchResults", JSON.stringify(response.data));

        // التوجيه بعد التخزين الناجح
        router.push("/admin/tableGeneralSearch"); // لـ Next.js
        // navigate("/new-page"); // لـ React Router
      }
    } catch (err) {
      triggerNotification(
        err.response?.data?.error || "An error occurred",
        "error"
      );
      console.log(err);
    }
  };

  console.log(selected?.driver?.id);

  const updatedSections = sections.map((section) => {
    if (
      section.title === "General Search" ||
      section.title === "Search Total Verified Collection" ||
      "Search Total Verified Collection"
    ) {
      section.inputs = section.inputs.map((input) => {
        if (input.name === "driver" || input.name === "verified_driver") {
          input.options =
            (drivers.length > 0
              ? drivers.map((driver) => ({
                  id: driver.id,
            value: driver.first_name+'  ' + driver.last_name,
                  
                }))
              : input.options) ?? input.options;
        }

        if (input.name === "vehicle") {
          input.options =
            (vehicles.length > 0
              ? vehicles.map((vehicle) => ({
                  id: vehicle.id,
                  value: vehicle?.vehicle_number,
                }))
              : input.options) ?? input.options;
        }

        if (input.name === "company") {
          input.options =
            (companies.length > 0
              ? companies.map((company) => ({
                  id: company.id,
                  value: company?.name,
                }))
              : input.options) ?? input.options;
        }

        if (input.name === "branch") {
          input.options =
            (branches.length > 0
              ? branches.map((branch) => ({
                  id: branch.id,
                  value: branch?.branch_name,
                }))
              : input.options) ?? input.options;
        }

        if (input.name === "payment_type") {
          input.options =
            (paymentType.length > 0
              ? paymentType.map((payment) => ({
                  id: payment.id,
                  value: payment?.payment_type,
                }))
              : input.options) ?? input.options;
        }

        return input;
      });
    }
    return section;
  });

  console.log(selected);

  return (
    <div className="py-5 px-3 sm:px-7">
      {updatedSections.map((section, index) => (
        <General
          key={index}
          title={section.title}
          inputs={section.inputs}
          setSelected={setSelected}
          handleSubmitSectionOne={
            section.title === "General Search" ? handleGeneralSearch : null
          }
          handleSubmitSectionTwo={
            section.title === "Search Collection on a particular Year"
              ? handleYearSearch
              : null
          }
          handleSubmitSectionThree={
            section.title === "Search Total Verified Collection"
              ? handleVerifiedCollectionSearch
              : null
          }
        />
      ))}
    </div>
  );
};

export default Page;

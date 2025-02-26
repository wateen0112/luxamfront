"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import userIcon from "/public/images/userIcon.svg";
import BarChart from "../../../components/charts/BarChart"
import DoughnutChart from "../../../components/charts/DoughnutChart";
import LineChart from "../../../components/charts/LineChart";
import StoreCard from "../../../components/charts/StoreCard";
import Loading from "../../../components/Loading";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Filter } from "lucide-react";
import {
  FaUser,
  FaTint,
  FaMoneyBillWave,
  FaCog,
  FaBuilding,
  FaTruck,
  FaCar,
  FaBoxes,
  FaGasPump,
} from "react-icons/fa";

const unit  =Cookies.get("unit") || "Liter"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const convertToKg = (value)=>value*.92
// Stat Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="px-5 py-6 shadow-lg rounded-2xl flex gap-5 items-center w-full bg-white hover:shadow-xl transition-shadow">
    <div className="flex flex-col gap-2">
      <h1 className="text-gray-600 text-sm sm:text-base font-medium">
        {title}
      </h1>
      <p className="font-semibold text-xl sm:text-2xl text-gray-800">{value}</p>
    </div>
    {/* عرض الأيقونة مباشرةً */}
    <div className="ml-auto text-blue-500 text-4xl">{icon}</div>
  </div>
);

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(12); // Default filter 12 months

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/home`, {
          params: { filter_date: filter },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        setError(error);
        setIsLoading(false);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [filter]);

  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-500">
        An error occurred while loading data.
      </div>
    );

  // إعداد البيانات الديناميكية لعرضها في StatCard
  const stats = [
    {
      title: "Total Users Today",
      value: data?.today_users ?? "-",
      icon: <FaUser className="text-[#17a3d7]" size={27} />, // رمز المستخدم
    },
    {
      title: unit ==='Liter'?  "Total LItters Today" :"Total Kgs Today",
      value:unit ==='Liter'?convertToKg( data?.today_liters):data?.today_liters ?? "-",
      icon: <FaTint className="text-[#17a3d7]" size={27} />, // رمز قطرة ماء يرمز للّترات
    },
    {
      title: "Total Amount Today",
      value: data?.today_amount ?? "-",
      icon: <FaMoneyBillWave className="text-[#17a3d7]" size={27} />, // ورقة نقدية ترمز للمبلغ
    },
    {
      title: "Today Processing",
      value: data?.today_processing ?? "-",
      icon: <FaCog className="text-[#17a3d7]" size={27} />, // ترس يرمز للمعالجة
    },
    {
      title: "Total Company",
      value: data?.total_company ?? "-",
      icon: <FaBuilding className="text-[#17a3d7]" size={27} />, // مبنى يرمز للشركة
    },
    {
      title: "Total Drivers",
      value: data?.total_drivers ?? "-",
      icon: <FaCar className="text-[#17a3d7]" size={27} />, // سيارة ترمز للسائقين
    },
    {
      title: "Total Vehicles",
      value: data?.total_vehicles ?? "-",
      icon: <FaTruck className="text-[#17a3d7]" size={27} />, // شاحنة ترمز للمركبات
    },
    {
      title: "Total Processing",
      value: data?.total_processing ?? "-",
      icon: <FaBoxes className="text-[#17a3d7]" size={27} />, // صناديق ترمز للعمليات أو المعالجة
    },
    {
      title: unit==='Liter'? "Total Processing Liters":"Total Processing Kgs",
      value: unit=='Liter'?convertToKg(data?.total_processing_liters):data?.total_processing_liters ?? "-",
      icon: <FaGasPump className="text-[#17a3d7]" size={27} />, // مضخة وقود ترمز للّترات المعالجة
    },
  ];

  // إعداد بيانات الرسوم البيانية
  const barChartDataSets = [
    {
      title: "Monthly Collected Kgs",
      data: {
        labels: ["Oil Collections", "Requests", "Instant Collections"],
        dataset: [
          {
            label:unit==="Liter" ? "Liters": "Kgs",
            data: unit==="Liter"?[
               data?.monthly_collected_liters?.total_oil_collections ?? 0,
               data?.monthly_collected_liters?.total_requests ?? 0,
                data?.monthly_collected_liters?.total_instant_collections ?? 0,
             ]:[
              convertToKg( data?.monthly_collected_liters?.total_oil_collections) ?? 0,
              convertToKg( data?.monthly_collected_liters?.total_requests )?? 0,
            convertToKg(    data?.monthly_collected_liters?.total_instant_collections )?? 0,
             ],
            backgroundColor: "rgba(54, 162, 235, 0.8)",
          },
        ],
      },
    },
    {
      title: "Monthly Collected Price",
      data: {
        labels: ["Oil Price", "Request Price", "Instant Price"],
        dataset: [
          {
            label: "Price",
            data: [
              data?.monthly_collected_price?.total_oil_price ?? 0,
              data?.monthly_collected_price?.total_request_price ?? 0,
              data?.monthly_collected_price?.total_instant_price ?? 0,
            ],
            backgroundColor: "rgba(255, 99, 132, 0.8)",
          },
        ],
      },
    },
    {
      title: "Monthly Collection Counts",
      data: {
        labels: ["Oil Collections", "Requests", "Instant Collections"],
        dataset: [
          {
            label: "Counts",
            data: [
              data?.monthly_collected_count?.total_oil_collection_count ?? 0,
              data?.monthly_collected_count?.total_request_count ?? 0,
              data?.monthly_collected_count?.total_instant_collection_count ??
                0,
            ],
            backgroundColor: "rgba(75, 192, 192, 0.8)",
          },
        ],
      },
    },
    {
      title: "Monthly Counts",
      data: {
        labels: ["Oil Collections", "Requests", "Instant Collections"],
        dataset: [
          {
            label: "Counts",
            data: [
              data?.monthly_count?.total_oil_collection_count ?? 0,
              data?.monthly_count?.total_request_count ?? 0,
              data?.monthly_count?.total_instant_collection_count ?? 0,
            ],
            backgroundColor: "rgba(153, 102, 255, 0.8)",
          },
        ],
      },
    },
  ];

  return (
    <section className="px-4 sm:px-14 py-8 min-h-screen">
      {/* Filter Dropdown */}
      <div className="flex flex-col gap-5 md:flex-row justify-between md:items-center mb-8">
        <h1 className="text-xl md:text-3xl font-semibold text-[#17a3d7] ">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-3">
          <Filter className="text-gray-500" />
          <Select
            value={filter.toString()}
            onValueChange={(value) => {
              setIsLoading(true); // عرض مؤشر التحميل عند تغيير الفلتر
              setFilter(parseInt(value));
            }}
          >
            <SelectTrigger className="w-[180px] bg-white shadow-md rounded-xl px-4 py-2 text-gray-700 font-medium">
              {filter === 1
                ? "Last Month"
                : filter === 3
                ? "Last 3 Months"
                : filter === 6
                ? "Last 6 Months"
                : "Last 12 Months"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-8 mb-10">
        <DoughnutChart data={data} />
        {barChartDataSets.map((chart, index) => (
          <BarChart
            key={index}
            title={chart.title}
            labels={chart.data.labels}
            dataset={chart.data.dataset}
          />
        ))}
        {/* <LineChart data={data} /> */}
      </div>

      {/* Stores Section */}
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 gap-8 mt-10">
        <StoreCard data={data} />
      </div>
    </section>
  );
};

export default Page;

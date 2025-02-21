"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement, 
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const salesData = {
  labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"], 
  datasets: [
    {
      label: "Company Sales",
      data: [12, 19, 15, 30, 25, 35], // بيانات المبيعات
      fill: false, // عدم ملء المنطقة أسفل الخط
      borderColor: "rgba(75,192,192,1)", // لون الخط
      tension: 0.1, // منحنى الخط
      borderWidth: 3, // عرض الخط
      pointBackgroundColor: "rgba(75,192,192,1)", // لون النقاط
      pointBorderColor: "#fff", // لون حدود النقاط
      pointBorderWidth: 2, // سمك حدود النقاط
      pointRadius: 5, // حجم النقاط
    },
  ],
};

// خيارات الرسم البياني
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return `${value}k`; // إضافة k إلى القيم
        },
      },
    },
  },
};

const LineChart = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-gray-700 mb-2">Header</h2>
      <div className="w-full h-[230px]">
        <Line data={salesData} options={chartOptions} />
      </div>
    </div>
  );
};

export default LineChart;

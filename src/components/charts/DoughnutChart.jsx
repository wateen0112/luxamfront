"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ArcElement,
  Legend,
} from "chart.js";

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

const DoughnutChart = ({ data }) => {
  // استخراج القيم من كائن البيانات
  const { total_amount, total_liters, total_users } = data;

  const doughnutData = {
    labels: ["Total Amount", "Total Liters"],
    datasets: [
      {
        data: [total_amount, total_liters], // استخدام القيم من كائن البيانات
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(75, 192, 75, 0.8)"],
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`; // عرض القيم
          },
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Statistics Overview
      </h2>
      <div className="w-full h-[240px] relative">
        <Doughnut
          className="absolute"
          data={doughnutData}
          options={doughnutOptions}
        />
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700 text-center">
          <p className="">Total Users</p>
          <h1 className="text-4xl font-semibold">
            {total_users.toLocaleString()}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;

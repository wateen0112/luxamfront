"use client";
import React from "react";
import { Bar as ChartBar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// تسجيل مكونات الرسم البياني
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ title, labels, dataset }) => {
  // إعداد البيانات الديناميكية للرسم البياني
  const chartData = {
    labels: labels, // تسميات الأعمدة تأتي من الخصائص
    datasets: dataset.map((dataItem) => ({
      label: dataItem.label,
      data: dataItem.data,
      backgroundColor: dataItem.backgroundColor || "rgba(54, 162, 235, 0.8)", // لون افتراضي إذا لم يتم تمريره
      barThickness: 12,
    })),
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
          callback: (value) => `${value}`, // إزالة 'k' لأن البيانات قد لا تحتاج لذلك
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="w-full h-[240px]">
        <ChartBar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BarChart;

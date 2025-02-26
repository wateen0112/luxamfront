"use client";
import React, { useEffect, useState } from "react";
import Table from "../../../components/tableComponents/Table";

const Page = () => {
  const [tablesData, setTablesData] = useState({});

  useEffect(() => {
    // جلب البيانات من localStorage بعد تحميل الصفحة
    const data = localStorage.getItem("searchResults");
    if (data) {
      setTablesData(JSON.parse(data));
    }
  }, []);

  const columnDefinitions = {
    instant_collections: [
      { key: "company_name", label: "Company" },
      { key: "public_id", label: "Public Id" },
      { key: "branch_name", label: "Branch" },
      { key: "payment_type", label: "Payment Type" },
      { key: "vehicle_number", label: "Vehicle" },
      { key: "driver_name", label: "Driver" },
      { key: "customer_name", label: "Customer Name" },
      { key: "quantity", label: "Quantity" },
      { key: "price", label: "Price" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "collected_at", label: "Collected At", type: "date" },
      { key: "action", label: "Action" },
    ],
    oil_collections: [
      { key: "public_id", label: "Public Id" },
      { key: "driver_name", label: "Driver" },
      { key: "vehicle_number", label: "Vehicle" },
      { key: "day", label: "Day" },
      { key: "company_name", label: "Company" },
      { key: "branch_name", label: "Branch" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "status", label: "Status" },
      { key: "collected_liters", label: "Collected Liters" },
      { key: "price", label: "Price" },
      { key: "action", label: "Action" },
    ],
    requests: [
      { key: "name", label: "User Name" },
      { key: "phone_number", label: "User Phone" },
      { key: "public_id", label: "Public Id" },
      { key: "status", label: "Status" },
      { key: "address", label: "Address" },
      { key: "quantity", label: "Quantity" },
      { key: "collected_at", label: "Collected At", type: "date" },
      { key: "created_at", label: "Created At", type: "date" },
      { key: "show", label: "Action" },
    ],
  };

  const tableViews = {
    instant_collections: "instantCollections",
    oil_collections: "oilCollectionScheduling",
    requests: "requests",
  };

  // التحقق مما إذا كانت جميع البيانات فارغة
  const isEmpty = Object.values(tablesData).every((data) => data?.length === 0);

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar flex flex-col items-center justify-center">
      <p className="text-xl sm:text-2xl font-bold text-[#17a3d7] self-start">
        Search Results
      </p>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-gray-500 text-lg sm:text-xl font-semibold">
            No data available
          </p>
        </div>
      ) : (
        Object.entries(tablesData).map(
          ([key, data]) =>
            data?.length > 0 && (
              <div key={key} className="mt-6 w-full">
                <p className="text-lg font-semibold text-gray-700 capitalize">
                  {key.replace("_", " ")}
                </p>
                <Table
                  data={{ data }}
                  columns={columnDefinitions[key]}
                  view={tableViews[key]}
                />
              </div>
            )
        )
      )}
    </div>
  );
};

export default Page;

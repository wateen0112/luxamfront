"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import Cookies from "js-cookie";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { useNotification } from "../notifi/NotificationContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const Table = ({
  data,
  columns,
  deleteApi,
  onNextPage,
  onPreviousPage,
  view,
}) => {
  const [tableData, setTableData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const triggerNotification = useNotification();

  useEffect(() => {
    if (data) {
      setTableData(data.data);
    }
  }, [data]);

  const handleDeleteOrder = async (id) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = Cookies.get("luxamToken");

    if (!token) {
      triggerNotification("Authentication token is missing.", "error");
      return;
    }

    confirmAlert({
      message: "Are you sure you want to delete this? This action cannot be undone",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const response = await fetch(`${apiUrl}/${deleteApi}/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              if (!response.ok) {
                const errorData = await response.json();
                triggerNotification(
                  `Error deleting order: ${
                    errorData?.error ||
                    errorData?.message ||
                    "Failed to delete the order."
                  }`,
                  "error"
                );
                throw new Error(errorData.error || "Failed to delete the order.");
              }
              triggerNotification("Deleted successfully.", "success");
              setTableData((prevData) =>
                prevData.filter((item) => item.id !== id)
              );
            } catch (error) {
              // Additional error handling can be added here
            }
          },
        },
        {
          label: "No",
          onClick: () => {}, // Close the confirmation if "No" is clicked
        },
      ],
    });
  };

  // Custom function to format date as month abbreviation (e.g., "Feb", "Mar")
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Handle invalid dates
    const day = date.getDate().toString().padStart(2, "0"); // Ensure 2 digits (e.g., "24")
    const month = date.toLocaleString("en", { month: "short" }); // e.g., "Feb"
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  const handleSort = (columnKey) => {
    const newSortOrder =
      sortColumn === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sortedData = [...tableData].sort((a, b) => {
      if (newSortOrder === "asc") {
        return a[columnKey] > b[columnKey] ? 1 : -1;
      } else {
        return a[columnKey] < b[columnKey] ? 1 : -1;
      }
    });
    setTableData(sortedData);
  };

  if (!tableData || tableData.length === 0) return <p>No data available</p>;

  return (
    <div className="mb-10">
      <div className="mt-6 md:w-full rounded-xl border border-gray-300 mb-3 shadow-sm text-sm 2xl:text-[15px] whitespace-nowrap">
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-[#fdf2eb] border-b border-gray-300 whitespace-nowrap">
                {columns.map((column) => (
                  <th key={column.key} className="py-4 px-3 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      {column.label}
                      {column.key !== "action" && column.key !== "show" && (
                        <button
                          className="text-gray-500"
                          onClick={() => handleSort(column.key)}
                        >
                          {sortColumn === column.key && sortOrder === "asc" ? (
                            <AiOutlineArrowUp size={14} />
                          ) : sortColumn === column.key &&
                            sortOrder === "desc" ? (
                            <AiOutlineArrowDown size={14} />
                          ) : (
                            <AiOutlineArrowUp size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-3 text-center">
                      {column.key === "action" ? (
                        <>
                          <button
                            className={`p-2 text-blue-500 hover:bg-yellow-100 hover:rounded ${
                              deleteApi ? "border-r" : ""
                            }`}
                            title="Edit"
                          >
                            <Link href={`/admin/${view}/update/${item.id}`}>
                              <AiOutlineEye size={20} />
                            </Link>
                          </button>
                          {deleteApi && (
                            <button
                              className="p-2 text-red-500 hover:bg-red-100 hover:rounded"
                              title="Delete"
                              onClick={() => handleDeleteOrder(item.id)}
                            >
                              <AiOutlineDelete size={20} />
                            </button>
                          )}
                        </>
                      ) : column.key === "show" ? (
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-100 hover:rounded"
                          title="Show"
                        >
                          <Link href={`/admin/${view}/show/${item.id}`}>
                            <AiOutlineEye size={20} />
                          </Link>
                        </button>
                      ) : column.key === "documents" ? (
                        <Link
                          href={`/admin/${view}/view/${item.id}`}
                          className="underline text-yellow-500 font-semibold"
                        >
                          View Documents
                        </Link>
                      ) : column.key === "contract_status" ? (
                        <span
                          className={`py-4 px-4 text-center font-semibold uppercase text-sm ${
                            item[column.key]
                              ?.toString()
                              .toLowerCase() === "active".toLowerCase()
                              ? "text-green-500"
                              : item[column.key] === "inactive"
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {item[column.key] || "-"}
                        </span>
                      ) : column.key === "status" || column.key === "user_status" ? (
                        <span
                          className={`py-4 px-4 text-center font-semibold uppercase text-sm ${
                            item[column.key]?.toString().toLowerCase() ===
                            "active".toLowerCase()
                              ? "text-green-500"
                              : item[column.key]?.toString().toLowerCase() ===
                                "inactive".toLowerCase()
                              ? "text-red-600"
                              : item[column.key]?.toString().toLowerCase() ===
                                "processing".toLowerCase()
                              ? "text-blue-500"
                              : "text-gray-500"
                          }`}
                        >
                          {item[column.key] || "-"}
                        </span>
                      ) : column.key === "invoice" ? (
                        item[column.key] && item[column.key] !== "-" ? (
                          <a
                            href={item[column.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline font-semibold"
                          >
                            View Invoice
                          </a>
                        ) : (
                          "-"
                        )
                      ) : column.key === "proof_of_payment" ? (
                        item[column.key] && item[column.key] !== "-" ? (
                          <a
                            href={item[column.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline font-semibold"
                          >
                            View Proof Of Payment
                          </a>
                        ) : (
                          "-"
                        )
                      ) : column.type === "date" ? (
                        formatDate(item[column.key]) // Use the month abbreviation for date columns
                      ) : (
                        item[column.key] ?? "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 mt-4">
        <span className="flex items-start text-gray-600">
          Showing page {data?.current_page} of {data?.last_page}
        </span>
        <div className="flex gap-1">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l hover:bg-gray-300"
            onClick={onPreviousPage}
            disabled={!data?.prev_page_url}
          >
            <FiArrowLeft size={18} />
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300"
            onClick={onNextPage}
            disabled={!data?.next_page_url}
          >
            <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
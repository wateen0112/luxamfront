"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/tableComponents/Header";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "@/components/Loading";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai"; // Import sorting icons

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [allLogs, setAllLogs] = useState(null); // Store all logs fetched from the API
  const [filteredLogs, setFilteredLogs] = useState(null); // Store logs filtered locally
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/activity-logs`);
  const [sortColumn, setSortColumn] = useState(null); // Track the column being sorted
  const [sortOrder, setSortOrder] = useState("asc"); // Track the sorting order
  const [search, setSearch] = useState(""); // State for search query

  const fetchLogs = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Process the data to make it more readable
      const processedData = response.data.data.map((log) => {
        const { properties, subject_type, causer_email, created_at, description } = log;

        // Extract relevant data based on the subject type
        let details = {};
        switch (subject_type) {
          case "App\\Models\\City":
            details = {
              type: "City Update",
              action: description,
              oldName: properties.data?.old?.name, // Access properties.data
              newName: properties.data?.new?.name, // Access properties.data
            };
            break;
          case "App\\Models\\Request":
            details = {
              type: "Request Update",
              action: description,
              oldStatus: properties.data?.old?.status, // Access properties.data
              newStatus: properties.data?.new?.status, // Access properties.data
            };
            break;
          case "App\\Models\\InstantCollection":
            details = {
              type: "Instant Collection",
              action: description,
              oldQuantity: properties.data?.old?.quantity, // Access properties.data
              newQuantity: properties.data?.new?.quantity, // Access properties.data
            };
            break;
          case "App\\Models\\OilCollection": // Add case for OilCollection
            details = {
              type: "Oil Collection",
              action: description,
              day: properties.data?.day, // Access properties.data
              price: properties.data?.price, // Access properties.data
              status: properties.data?.status, // Access properties.data
              quantity: properties.data?.quantity, // Access properties.data
              public_id: properties.data?.public_id, // Access properties.data
              address_id: properties.data?.address_id, // Access properties.data
              payment_type_id: properties.data?.payment_type_id, // Access properties.data
              company_branch_id: properties.data?.company_branch_id, // Access properties.data
              vehicle_driver_id: properties.data?.vehicle_driver_id, // Access properties.data
            };
            break;
          default:
            details = {
              type: "Other",
              action: description,
            };
        }

        return {
          id: log.id, // Ensure each log has a unique ID
          type: details.type,
          action: details.action,
          causerEmail: causer_email,
          createdAt: new Date(created_at).toLocaleString(),
          ...details, // Spread the processed details
        };
      });

      // Store all logs and filtered logs
      setAllLogs({ ...response.data, data: processedData });
      setFilteredLogs({ ...response.data, data: processedData });
    } catch (err) {
      setError("Failed to fetch logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPageUrl);
  }, [currentPageUrl]); // Fetch logs only when the page changes

  // Handle sorting
  const handleSort = (columnKey) => {
    const newSortOrder = sortColumn === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sortedData = [...filteredLogs.data].sort((a, b) => {
      if (a[columnKey] < b[columnKey]) return newSortOrder === "asc" ? -1 : 1;
      if (a[columnKey] > b[columnKey]) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredLogs({ ...filteredLogs, data: sortedData });
  };

  // Filter logs locally based on search query
  useEffect(() => {
    if (allLogs) {
      const filteredData = allLogs.data.filter((log) => {
        return (
          log.type.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.causerEmail.toLowerCase().includes(search.toLowerCase()) ||
          log.createdAt.toLowerCase().includes(search.toLowerCase())
        );
      });
      setFilteredLogs({ ...allLogs, data: filteredData });
    }
  }, [search, allLogs]); // Re-filter logs when search query changes

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const handleNextPage = () => {
    if (allLogs?.pagination?.current_page < allLogs?.pagination?.last_page) {
      setCurrentPageUrl(`${apiUrl}/activity-logs?page=${allLogs.pagination.current_page + 1}`);
    }
  };

  const handlePreviousPage = () => {
    if (allLogs?.pagination?.current_page > 1) {
      setCurrentPageUrl(`${apiUrl}/activity-logs?page=${allLogs.pagination.current_page - 1}`);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 hide-scrollbar">
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#17a3d7]">
          Activity Logs
        </p>
        <Header
          exportFun={false}
          link="/admin/activity-logs/add"
          setSearch={setSearch} // Pass setSearch to Header
          showAddButton={false} // Hide the Add button
        />

        {/* Normal HTML Table with Sorting */}
        <div className="overflow-x-auto mt-8 bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#fdf2eb] border-b border-gray-300 whitespace-nowrap">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortColumn === "type" && (
                      sortOrder === "asc" ? <AiOutlineArrowUp size={14} /> : <AiOutlineArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("action")}
                >
                  <div className="flex items-center gap-2">
                    Action
                    {sortColumn === "action" && (
                      sortOrder === "asc" ? <AiOutlineArrowUp size={14} /> : <AiOutlineArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("causerEmail")}
                >
                  <div className="flex items-center gap-2">
                    Causer Email
                    {sortColumn === "causerEmail" && (
                      sortOrder === "asc" ? <AiOutlineArrowUp size={14} /> : <AiOutlineArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Created At
                    {sortColumn === "createdAt" && (
                      sortOrder === "asc" ? <AiOutlineArrowUp size={14} /> : <AiOutlineArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs?.data?.length > 0 ? (
                filteredLogs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.causerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.type === "City Update" ? (
                        <div>
                          <p>Old Name: {log.oldName}</p>
                          <p>New Name: {log.newName}</p>
                        </div>
                      ) : log.type === "Request Update" ? (
                        <div>
                          <p>Old Status: {log.oldStatus}</p>
                          <p>New Status: {log.newStatus}</p>
                        </div>
                      ) : log.type === "Instant Collection" ? (
                        <div>
                          <p>Old Quantity: {log.oldQuantity}</p>
                          <p>New Quantity: {log.newQuantity}</p>
                        </div>
                      ) : log.type === "Oil Collection" ? ( // Add case for Oil Collection
                        <div>
                          <p>Day: {log.day}</p>
                          <p>Quantity: {log.quantity}</p>
                          <p>Price: {log.price}</p>
                          <p>Status: {log.status}</p>
                          <p>Public ID: {log.public_id}</p>
                          <p>Address ID: {log.address_id}</p>
                          <p>Payment Type ID: {log.payment_type_id}</p>
                          <p>Company Branch ID: {log.company_branch_id}</p>
                          <p>Vehicle Driver ID: {log.vehicle_driver_id}</p>
                        </div>
                      ) : (
                        "No details available"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={allLogs?.pagination?.current_page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {allLogs?.pagination?.current_page} of {allLogs?.pagination?.last_page}
          </span>
          <button
            onClick={handleNextPage}
            disabled={allLogs?.pagination?.current_page === allLogs?.pagination?.last_page}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
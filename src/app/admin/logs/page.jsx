"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/tableComponents/Header";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "../../../components/Loading";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [allLogs, setAllLogs] = useState(null);
  const [filteredLogs, setFilteredLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${apiUrl}/activity-logs`);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const fetchLogs = async (url) => {
    try {
      setLoading(true);
      const token = Cookies.get("luxamToken");

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure response.data.data is an array
      const logsData = Array.isArray(response.data.data) ? response.data.data : [];

      // Process the data to make it more readable
      const processedData = logsData.map((log) => {
        const { properties, subject_type, causer_first_name, causer_last_name, causer_email, created_at, description } = log;

        let details = {};
        switch (subject_type) {
          case "App\\Models\\Vehicle":
            details = {
              type: "Vehicle",
              action: description,
              oldVehicleNumber: properties.old?.vehicle_number,
              newVehicleNumber: properties.new?.vehicle_number,
            };
            break;
          case "App\\Models\\User":
            details = {
              type: "User",
              action: description,
              oldFirstName: properties.old?.first_name,
              newFirstName: properties.new?.first_name,
              oldLastName: properties.old?.last_name,
              newLastName: properties.new?.last_name,
              oldPhoneNumber: properties.old?.phone_number,
              newPhoneNumber: properties.new?.phone_number,
              oldUsername: properties.old?.username,
              newUsername: properties.new?.username,
              oldRole: properties.old?.role,
              newRole: properties.new?.role,
            };
            break;
          case "App\\Models\\CompanyBranch":
            details = {
              type: "Company Branch",
              action: description,
              oldBranchName: properties.old?.branch_name,
              newBranchName: properties.new?.branch_name,
              oldBranchCode: properties.old?.branch_code,
              newBranchCode: properties.new?.branch_code,
              oldArea: properties.old?.area,
              newArea: properties.new?.area,
            };
            break;
          case "App\\Models\\Area":
            details = {
              type: "Area",
              action: description,
              oldName: properties.old?.name,
              newName: properties.new?.name,
              oldCityId: properties.old?.city_id,
              newCityId: properties.new?.city_id,
            };
            break;
          case "App\\Models\\InstantCollection":
            details = {
              type: "Instant Collection",
              action: description,
              oldQuantity: properties.old?.quantity,
              newQuantity: properties.new?.quantity,
              oldPrice: properties.old?.price,
              newPrice: properties.new?.price,
              oldCompanyId: properties.old?.company_id,
              newCompanyId: properties.new?.company_id,
              oldBranchId: properties.old?.company_branch_id,
              newBranchId: properties.new?.company_branch_id,
            };
            break;
          case null:
            details = {
              type: "Unknown",
              action: description,
              error: properties.error || "No subject details available",
            };
            break;
          default:
            details = {
              type: subject_type?.split("\\").pop() || "Unknown",
              action: description,
              properties: properties || {},
            };
        }

        return {
          id: log.id,
          type: details.type,
          action: details.action,
          causerFirstName: causer_first_name,
          causerLastName: causer_last_name,
          causerEmail: causer_email,
          createdAt: new Date(created_at).toLocaleString(),
          ...details,
        };
      });

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
  }, [currentPageUrl]);

  const handleSort = (columnKey) => {
    const newSortOrder = sortColumn === columnKey && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sortedData = [...(filteredLogs?.data || [])].sort((a, b) => {
      const aValue = a[columnKey] || "";
      const bValue = b[columnKey] || "";
      if (aValue < bValue) return newSortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredLogs({ ...filteredLogs, data: sortedData });
  };

  useEffect(() => {
    if (allLogs) {
      const filteredData = allLogs.data.filter((log) => {
        return (
          (log.type?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (log.action?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (log.causerFirstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (log.causerLastName?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (log.causerEmail?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (log.createdAt?.toLowerCase() || "").includes(search.toLowerCase())
        );
      });
      setFilteredLogs({ ...allLogs, data: filteredData });
    }
  }, [search, allLogs]);

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
          link=""
          setSearch={setSearch}
          showAddButton={false}
        />

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
                  onClick={() => handleSort("causerFirstName")}
                >
                  <div className="flex items-center gap-2">
                    Causer First Name
                    {sortColumn === "causerFirstName" && (
                      sortOrder === "asc" ? <AiOutlineArrowUp size={14} /> : <AiOutlineArrowDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("causerLastName")}
                >
                  <div className="flex items-center gap-2">
                    Causer Last Name
                    {sortColumn === "causerLastName" && (
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
                      {log.causerFirstName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.causerLastName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.causerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.createdAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.type === "Vehicle" ? (
                        <>
                          <p>Old Vehicle Number: {log.oldVehicleNumber || "N/A"}</p>
                          <p>New Vehicle Number: {log.newVehicleNumber || "N/A"}</p>
                        </>
                      ) : log.type === "User" ? (
                        <>
                          <p>Old First Name: {log.oldFirstName || "N/A"}</p>
                          <p>New First Name: {log.newFirstName || "N/A"}</p>
                          <p>Old Last Name: {log.oldLastName || "N/A"}</p>
                          <p>New Last Name: {log.newLastName || "N/A"}</p>
                          <p>Old Phone: {log.oldPhoneNumber || "N/A"}</p>
                          <p>New Phone: {log.newPhoneNumber || "N/A"}</p>
                          <p>Old Username: {log.oldUsername || "N/A"}</p>
                          <p>New Username: {log.newUsername || "N/A"}</p>
                          <p>Old Role: {log.oldRole || "N/A"}</p>
                          <p>New Role: {log.newRole || "N/A"}</p>
                        </>
                      ) : log.type === "Company Branch" ? (
                        <>
                          <p>Old Branch Name: {log.oldBranchName || "N/A"}</p>
                          <p>New Branch Name: {log.newBranchName || "N/A"}</p>
                          <p>Old Branch Code: {log.oldBranchCode || "N/A"}</p>
                          <p>New Branch Code: {log.newBranchCode || "N/A"}</p>
                          <p>Old Area: {log.oldArea || "N/A"}</p>
                          <p>New Area: {log.newArea || "N/A"}</p>
                        </>
                      ) : log.type === "Area" ? (
                        <>
                          <p>Old Name: {log.oldName || "N/A"}</p>
                          <p>New Name: {log.newName || "N/A"}</p>
                          <p>Old City ID: {log.oldCityId || "N/A"}</p>
                          <p>New City ID: {log.newCityId || "N/A"}</p>
                        </>
                      ) : log.type === "Instant Collection" ? (
                        <>
                          <p>Old Quantity: {log.oldQuantity || "N/A"}</p>
                          <p>New Quantity: {log.newQuantity || "N/A"}</p>
                          <p>Old Price: {log.oldPrice || "N/A"}</p>
                          <p>New Price: {log.newPrice || "N/A"}</p>
                          <p>Old Company ID: {log.oldCompanyId || "N/A"}</p>
                          <p>New Company ID: {log.newCompanyId || "N/A"}</p>
                          <p>Old Branch ID: {log.oldBranchId || "N/A"}</p>
                          <p>New Branch ID: {log.newBranchId || "N/A"}</p>
                        </>
                      ) : log.type === "Unknown" ? (
                        <p>{log.error || "No details available"}</p>
                      ) : (
                        Object.entries(log.properties).map(([key, value]) => (
                          <p key={key}>{key.replace(/_/g, " ")}: {value || "N/A"}</p>
                        ))
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
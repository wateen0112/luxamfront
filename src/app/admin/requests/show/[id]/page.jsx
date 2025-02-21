"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FaPaperPlane, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import RequestCard from "@/components/RequestPage/RequestCard";
import AddressCard from "@/components/RequestPage/AddressCard";
import Loading from "@/components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const InputField = ({
  name,
  label,
  value,
  onChange,
  readOnly,
  hide,
  number,
}) => (
  <div className={`mb-5 ${hide === true ? "hidden" : ""}`}>
    <label className="block font-medium text-gray-600">{label}</label>
    <input
      name={name}
      value={value || ""}
      readOnly={readOnly}
      type={`${number === true ? "number" : "text"}`}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={`mt-1 w-full px-4 py-2 border rounded-md outline-none`}
    />
  </div>
);

const SelectField = ({ name, label, options, onChange }) => (
  <div>
    <label className="block font-medium text-gray-600">{label}</label>
    <Select onValueChange={(val) => onChange(val)}>
      <SelectTrigger className="w-full mt-1 px-4 py-2 border rounded-md outline-none">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map(({ value, label }, index) => (
          <SelectItem key={index} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const Page = () => {
  const router = useRouter();
  const { id } = useParams(); // استخراج ID من الرابط
  const [requestData, setRequestData] = useState(null);
  const [nearestDrivers, setNearestDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [address, setAddress] = useState(null);
  const [driverVehicles, setDriverVehicles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchRequestData = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(`${apiUrl}/requests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setRequestData(data.user_request);
        setAddress(data.user_request.address || "");
        setEditableData({
          price: data.user_request.price || "",
          collectedQuantity: data.user_request.collected_liters || "",
          collectedPrice: data.user_request.collected_price || "",
        });
        setNearestDrivers(
          data.drivers.map((driver) => ({
            value: driver.id,
            label: driver.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching request data:", error);
      }
    };

    fetchRequestData();
  }, [id]);

  useEffect(() => {
    // تأكد من أن selectedDriver ليس null قبل استدعاء API
    if (!selectedDriver) return;

    const fetchDriverVehicles = async () => {
      const token = Cookies.get("luxamToken");
      try {
        const response = await axios.get(
          `${apiUrl}/get_vehicle_drivers/${selectedDriver}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const vehicles = response.data.data.map((vehicle) => ({
          value: vehicle.vehicle_id,
          label: vehicle.vehicle_number,
        }));

        setDriverVehicles(vehicles);
      } catch (error) {
        console.error("Error fetching driver vehicles:", error);
      }
    };

    fetchDriverVehicles();
  }, [selectedDriver]); // يعتمد على selectedDriver

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleSendRequest = (data) => {
    const token = Cookies.get("luxamToken");
    axios
      .put(
        `${apiUrl}/requests/${id}`,
        data, // البيانات التي سيتم إرسالها
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        router.push("/admin/requests");
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  };

  const handleSubmit = async () => {
    if (!note.trim()) {
      alert("Please enter a note before submitting.");
      return;
    }
    const token = Cookies.get("luxamToken");

    try {
      const response = await axios.post(
        `${apiUrl / `reject_request/${id}`}`,
        { note },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push("/admin/requests");
      setIsOpen(false);
      setNote("");
    } catch (error) {
      alert("An error occurred while sending the note.");
      console.error(error);
    }
  };

  if (!requestData) {
    return <Loading />;
  }

  return (
    <div className="p-3 sm:p-7">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#17a3d7]">
        Request Details
      </h1>
      <div className="flex flex-col mt-7">
        <RequestCard data={requestData} />
        <AddressCard data={address} />
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* Request Details */}
          <div className="py-6 px-4 sm:px-7 bg-gray-50 shadow-sm rounded-lg">
            <p className="text-xl sm:text-2xl font-semibold text-gray-700">
              Request Details
            </p>
            <div className="mt-6">
              <InputField
                name="requestType"
                label="Request type"
                value={requestData.request_type}
                readOnly
              />
              <InputField
                name="userName"
                label="User name"
                value={requestData.user.name}
                readOnly
              />
              <InputField
                name="userEmail"
                label="User email"
                value={requestData.user.email}
                readOnly
              />
              <InputField
                name="userPhone"
                label="User phone number"
                value={requestData.user.phone_number}
                readOnly
              />
              <InputField
                name="quantity"
                label="Quantity"
                value={requestData.quantity}
                readOnly
              />
              <InputField
                name="price"
                label="Price"
                value={editableData.price}
                onChange={(val) =>
                  setEditableData({ ...editableData, price: val })
                }
                readOnly={requestData.price !== null}
                number={true}
              />
              <div className="mt-5 flex flex-col gap-5">
                <SelectField
                  name="nearestDrivers"
                  label="Nearest Drivers"
                  options={nearestDrivers}
                  onChange={setSelectedDriver}
                />
                <SelectField
                  name="vehicle"
                  label="Vehicle"
                  options={driverVehicles}
                  onChange={setSelectedVehicle}
                />
              </div>
              <div className="mt-5">
                <InputField
                  name="createdAt"
                  label="Created at"
                  value={formatDate(requestData.created_at)}
                />
              </div>

              {requestData.price === null && (
                <div className="mt-5 flex items-center gap-4">
                  <button
                    disabled={
                      !selectedDriver || !selectedVehicle || !editableData.price
                    }
                    onClick={() =>
                      handleSendRequest({
                        price: editableData.price,
                        driver_id: selectedDriver,
                        vehicle_id: selectedVehicle,
                      })
                    }
                    className="flex items-center justify-center bg-[#17a3d7] text-white py-2 px-2 text-sm sm:text-[16px] sm:px-4 rounded-md hover:bg-[#17a3d7]/90 transition-all"
                  >
                    <FaPaperPlane className="mr-2" />
                    Send to Driver
                  </button>

                  <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center bg-red-500 text-white py-2 px-2 text-sm sm:text-[16px] sm:px-4 rounded-md hover:bg-red-500/90 transition-all"
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel & Send Note
                  </button>
                </div>
              )}

              {!requestData.status === "collected" &&
                requestData.price !== null && (
                  <div className="mt-5 flex items-center gap-4">
                    <button
                      disabled={
                        !selectedDriver ||
                        !selectedVehicle ||
                        !editableData.price
                      }
                      onClick={() =>
                        handleSendRequest({
                          price: editableData.price,
                          driver_id: selectedDriver,
                          vehicle_id: selectedVehicle,
                        })
                      }
                      className="flex items-center justify-center bg-[#17a3d7] text-white py-2 px-2 text-sm sm:text-[16px] sm:px-4 rounded-md hover:bg-[#17a3d7]/90 transition-all"
                    >
                      <FaPaperPlane className="mr-2" />
                      Send to Driver
                    </button>

                    <button
                      onClick={() => setIsOpen(true)}
                      className="flex items-center justify-center bg-red-500 text-white py-2 px-2 text-sm sm:text-[16px] sm:px-4 rounded-md hover:bg-red-500/90 transition-all"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel & Send Note
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Collected Details */}
          <div className="py-6 px-4 sm:px-7 bg-gray-50 shadow-sm rounded-lg">
            <p className="text-xl sm:text-2xl font-semibold text-gray-700">
              Collected Details
            </p>
            <div className="mt-6">
              <InputField
                name="collectedAt"
                label="Collected at"
                value={formatDate(requestData.collected_at)}
                readOnly
                hide={requestData.collected_at === null}
              />
              <InputField
                name="collectedQuantity"
                label="Collected quantity"
                value={editableData.collectedQuantity}
                number={true}
                onChange={(val) =>
                  setEditableData({ ...editableData, collectedQuantity: val })
                }
                readOnly={requestData.collected_liters !== null}
              />
              <InputField
                name="collectedPrice"
                label="Collected price"
                value={editableData.collectedPrice}
                number={true}
                onChange={(val) =>
                  setEditableData({ ...editableData, collectedPrice: val })
                }
                readOnly={requestData.collected_price !== null}
              />
              <div
                className={`mt-5 flex justify- w-full ${
                  requestData.collected_price !== null ||
                  requestData.collected_liters !== null
                    ? "hidden"
                    : ""
                }`}
              >
                <button
                  disabled={
                    !editableData.collectedPrice ||
                    !editableData.collectedQuantity
                  }
                  onClick={() =>
                    handleSendRequest({
                      collected_price: editableData.collectedPrice,
                      collected_quantity: editableData.collectedQuantity,
                    })
                  }
                  className="flex items-center justify-center bg-green-600 text-white text-sm sm:text-[16px] py-2 px-2 sm:px-4 rounded-md hover:bg-green-600/90 transition-all w-full"
                >
                  <FaCheckCircle className="mr-2" />
                  Mark As Collected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add a Note
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#de8945]"
              rows="4"
              placeholder="Write your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-all"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;

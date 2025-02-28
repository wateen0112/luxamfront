"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import Loading from "../../../../../components/Loading";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const InstantCollections = () => {
  const router = useRouter();
  const { id } = useParams();
  const [collections, setCollections] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = Cookies.get("luxamToken");
        const response = await axios.get(`${apiUrl}/instant_collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedCollection = response.data.instant_collection || null;
        const fetchedPaymentTypes = response.data.payment_types || [];

        if (fetchedCollection) {
          const matchedType = fetchedPaymentTypes.find(
            (type) => type.payment_type === fetchedCollection.payment_type
          );
          const collectionWithPaymentType = {
            ...fetchedCollection,
            payment_type_id: matchedType ? matchedType.id : "", // Use payment_type_id to match backend
            initialData: {
              ...fetchedCollection,
              payment_type_id: matchedType ? matchedType.id : "", // Match backend field name
            },
          };

          setCollections([collectionWithPaymentType]);
        } else {
          setCollections([]);
        }

        setPaymentTypes(fetchedPaymentTypes);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [id]);

  const handleChange = (collectionId, field, value) => {
    setCollections((prevCollections) =>
      prevCollections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, [field]: value }
          : collection
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const token = Cookies.get("luxamToken");
      const updatedCollections = collections
        .map(({ initialData, id, payment_type_id, ...collection }) => {
          const updatedFields = {};

          // Only include fields the backend supports
          const supportedFields = [
            "company_id",
            "company_branch_id",
            "vehicle_driver_id",
            "quantity",
            "price",
            "payment_type_id",
            "status",
          ];

          supportedFields.forEach((key) => {
            if (collection[key] !== undefined && collection[key] !== initialData[key]) {
              updatedFields[key] = collection[key];
            }
          });

          // Handle payment_type_id separately
          if (payment_type_id !== initialData.payment_type_id) {
            updatedFields["payment_type_id"] = payment_type_id;
          }

          return Object.keys(updatedFields).length ? updatedFields : null;
        })
        .filter(Boolean);

      if (updatedCollections.length > 0) {
        console.log("Sending update:", updatedCollections[0]);
        const response = await axios.put(
          `${apiUrl}/instant_collections/${id}`,
          updatedCollections[0],
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        console.log("Response:", response.data);
        router.push("/admin/instantCollections");
      } else {
        alert("No changes to update");
      }
    } catch (error) {
      alert("Failed to update data");
      console.error("Update error:", error.response?.data || error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="mx-auto p-8 rounded-lg">
      <h2 className="text-3xl font-semibold mb-6 text-start text-[#de8945]">
        Instant Collections
      </h2>
      {collections.length === 0 ? (
        <p className="text-start text-gray-500">No data available</p>
      ) : (
        collections.map((collection) => (
          <div key={collection?.id} className="mb-5">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={collection?.customer_name || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={collection?.customer_mobile || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Customer Address
                </label>
                <input
                  type="text"
                  value={collection?.customer_address || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Company Name
                </label>
                <input
                  type="text"
                  value={collection?.company?.name || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={collection?.company_branch?.branch_name || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Payment Type
                </label>
                <select
                  value={collection?.payment_type_id || ""}
                  onChange={(e) =>
                    handleChange(collection.id, "payment_type_id", e.target.value)
                  }
                  className="input py-3"
                >
                  <option value="">Select Payment Type</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.payment_type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Quantity
                </label>
                <input
                  min={1}
                  type="number"
                  value={collection?.quantity || ""}
                  onChange={(e) =>
                    handleChange(collection.id, "quantity", e.target.value)
                  }
                  className="input py-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Price
                </label>
                <input
                  type="number"
                  min={1}
                  value={collection?.price || ""}
                  onChange={(e) =>
                    handleChange(collection.id, "price", e.target.value)
                  }
                  className="input py-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  ISCC
                </label>
                <input
                  type="text"
                  value={collection?.iscc || ""}
                  readOnly
                  className="input py-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">
                  Note
                </label>
                <textarea
                  value={collection?.note || ""}
                  readOnly
                  className="input py-3 h-44 bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))
      )}
      <button
        onClick={handleSubmit}
        className="bg-[#de8945] hover:bg-[#de8945]/90 transition-all font-semibold text-white px-6 py-2.5 rounded-md w-full"
      >
        Update
      </button>
    </div>
  );
};

export default InstantCollections;
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import { Loader } from "@googlemaps/js-api-loader";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const UpdateBranchPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const staticMarkerRef = useRef(null);
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    company_id: "",
    branch_name: "",
    branch_code: "",
    area: "",
    latitude: null,
    longitude: null,
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false); // منع تكرار تهيئة الخريطة
  const [area, setArea] = useState([]);

  useEffect(() => {
    const token = Cookies.get("luxamToken");

    const fetchBranchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/company-branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const branch = response.data; // تعيين الإحداثيات القادمة من الواجهة الخلفية للموقع القديم
        setFormData({
          company_id: branch.company_id,
          branch_name: branch.branch_name,
          branch_code: branch.branch_code || "",
          area: branch.area || "",
          latitude: parseFloat(branch.address.latitude),
          longitude: parseFloat(branch.address.longitude),
        });
      } catch (err) {
        setError("Failed to load branch data.");
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(response.data.data);
      } catch (err) {
        setError("Failed to load companies.");
      }
    };

    fetchBranchData();
    fetchCompanies();
  }, [id]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyDigy7JFuzq8xNoKdQf8hsYWL3bi-QPfZA",
        version: "weekly",
        libraries: ["places"],
      });

      const { Map } = await loader.importLibrary("maps");
      const { Marker } = await loader.importLibrary("marker");

      const mapOptions = {
        center: { lat: formData.latitude, lng: formData.longitude },
        zoom: 12,
      };

      // تهيئة الخريطة وتعيينها
      const newMap = new Map(mapRef.current, mapOptions);
      setMap(newMap);

      // الماركر الأحمر ثابت في الموقع القديم فقط بعد تحميل الإحداثيات
      if (formData.latitude && formData.longitude) {
        staticMarkerRef.current = new Marker({
          map: newMap,
          position: { lat: formData.latitude, lng: formData.longitude }, // استخدام الإحداثيات القادمة من الواجهة الخلفية
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // ماركر أحمر
          },
          zIndex: 1, // تعيين zIndex للماركر الأحمر
        });
      }

      // الماركر الأزرق متحرك
      markerRef.current = new Marker({
        map: newMap,
        position: {
          lat: formData.latitude + 0.0001,
          lng: formData.longitude + 0.0001,
        }, // إبعاد الماركرين
        draggable: true,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // ماركر أزرق
        },
        zIndex: 2, // تعيين zIndex للماركر الأزرق ليكون فوق الأحمر
      });

      // تحديث الإحداثيات عند سحب الماركر الأزرق
      markerRef.current.addListener("dragend", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      });

      // إعداد البحث التلقائي
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current
      );
      autocomplete.bindTo("bounds", newMap);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        newMap.setCenter({ lat, lng });
        markerRef.current.setPosition({ lat, lng });

        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
        }));
      });

      // إضافة حدث عند النقر على الخريطة
      newMap.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerRef.current.setPosition({ lat, lng });

        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
        }));
      });

      setMapInitialized(true); // تم تهيئة الخريطة
    };

    // تهيئة الخريطة فقط إذا كانت الإحداثيات غير فارغة ولم يتم تهيئة الخريطة بعد
    if (formData.latitude && formData.longitude && !mapInitialized) {
      initMap();
    }
  }, [formData.latitude, formData.longitude, mapInitialized]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/areas`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setArea(response.data.data.data);
      } catch (error) {
        // setCompaniesError("Failed to load companies.");
      } finally {
      }
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = Cookies.get("luxamToken");

    try {
      const response = await axios.put(
        `${apiUrl}/company-branches/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push("/admin/companiesBranches");
    } catch (err) {
      console.log("Update Error:", err);
      setError("Error updating branch");
    } finally {
      setLoading(false);
    }
  };

  console.log(formData);
  return (
    <div className="md:px-16 px-8 py-8 max-w-6xl mx-auto">
      <h1 className="md:text-3xl text-2xl font-bold text-[#de8945] mb-10">
        Update Branch
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 md:gap-8 gap-6"
      >
        <div>
          <label
            className="block font-medium text-gray-600"
            htmlFor="company_id"
          >
            Company *
          </label>
          <select
            id="company_id"
            value={formData.company_id}
            onChange={handleChange}
            className="input mt-1 w-full px-4 py-2 border rounded-md"
          >
            <option value="" disabled>
              Select a company
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-600" htmlFor="area">
            Branch Location *
          </label>

          <select
            id="area"
            defaultValue={formData?.area} // تعيين القيمة الافتراضية
            onChange={handleChange}
            className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
          >
            <option value="" disabled>
              {formData?.area || "Select an area"}
            </option>
            {area.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Branch Name *"
          id="branch_name"
          type="text"
          value={formData.branch_name}
          onChange={handleChange}
        />
        <InputField
          label="Branch Code *"
          id="branch_code"
          type="text"
          value={formData.branch_code}
          onChange={handleChange}
        />

        <div className="mt-6 col-span-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
          />
        </div>

        <div style={{ height: "420px" }} ref={mapRef} className="col-span-2" />

        <button
          type="submit"
          disabled={loading}
          className="px-16 py-2 bg-[#de8945] text-lg text-white rounded-md font-semibold w-full col-span-2"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="input mt-1 w-full px-4 py-2 border rounded-md"
    />
  </div>
);

export default UpdateBranchPage;

"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Loader } from "@googlemaps/js-api-loader";
import { useNotification } from "@/components/notifi/NotificationContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const center = { lat: 25.276987, lng: 55.296249 }; // دبي

const AddBranchPage = () => {
  const triggerNotification = useNotification();

  const router = useRouter();
  const mapRef = useRef(null);
  const markerRef = useRef(null); // لإضافة مرجع للماركر
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyId: "",
    branchName: "",
    branchCode: "",
    city: "",
    area: "",
    latitude: center.lat,
    longitude: center.lng,
  });

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyDigy7JFuzq8xNoKdQf8hsYWL3bi-QPfZA",
        version: "weekly",
        libraries: ["places"],
      });

      const { Map } = await loader.importLibrary("maps");
      const { Marker } = await loader.importLibrary("marker");

      const position = { lat: center.lat, lng: center.lng };
      const mapOptions = {
        center: position,
        zoom: 12,
        mapId: "MY_NEXTJS_MAPID",
      };
      const map = new Map(mapRef.current, mapOptions);

      markerRef.current = new Marker({
        map: map,
        position: position,
      });

      // إعداد البحث التلقائي
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current
      );
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map.setCenter({ lat, lng });
        markerRef.current.setPosition({ lat, lng });

        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
        }));
      });

      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerRef.current.setPosition({ lat, lng });

        setFormData((prevData) => ({
          ...prevData,
          latitude: lat,
          longitude: lng,
        }));
      });
    };
    initMap();
  }, []);

  const [companies, setCompanies] = useState([]);
  const [area, setArea] = useState([]);
  const [city, setCity] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);
  const [cityId, setCityId] = useState(null);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCompanies(response.data.data);
      } catch (error) {
        setCompaniesError("Failed to load companies.");
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/cities/${cityId?.id}/areas`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setArea(response?.data?.areas);
      } catch (error) {
        // setCompaniesError("Failed to load companies.");
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [cityId?.id]);

  useEffect(() => {
    const token = Cookies.get("luxamToken");
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setCity(response.data.data.data);
      } catch (error) {
        // setCompaniesError("Failed to load companies.");
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = Cookies.get("luxamToken");
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    // التحقق من جميع الحقول المطلوبة
    if (
      !formData.companyId ||
      !formData.branchName ||
      !formData.branchCode ||
      !formData.city ||
      !formData.area ||
      !formData.latitude ||
      !formData.longitude
    ) {
      triggerNotification("All fields are required.", "error");
      setLoading(false);
      return;
    }

    const requestData = {
      company_id: formData.companyId,
      branch_name: formData.branchName,
      branch_code: formData.branchCode,
      city: formData.city,
      area: formData.area,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    try {
      await axios.post(`${apiUrl}/company-branches`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      router.push("/admin/companiesBranches");
      setSuccess("Branch added successfully!");
      setFormData({
        companyId: "",
        branchName: "",
        branchCode: "",
        city: "",
        area: "",
        latitude: center.lat,
        longitude: center.lng,
      });
    } catch (err) {
      triggerNotification(err.response?.data?.error, "error");
      console.log(err);
      setError(
        err.response?.data?.error ||
          "An error occurred while adding the branch."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:px-16 px-8 py-8 max-w-6xl mx-auto">
      <header>
        <h1 className="md:text-3xl text-2xl font-bold text-[#de8945]">
          Add Branch
        </h1>
      </header>

      <main className="mt-10">
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 md:gap-8 gap-6"
        >
          <div>
            <label
              className="block font-medium text-gray-600"
              htmlFor="companyId"
            >
              Company *
            </label>

            <select
              id="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
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
            <label className="block font-medium text-gray-600" htmlFor="city">
              City *
            </label>

            <select
              id="city"
              value={formData.city}
              onChange={(e) => {
                const selectedCity = city.find(
                  (c) => c.name === e.target.value
                );
                if (selectedCity) {
                  setCityId({ id: selectedCity.id, name: selectedCity.name });

                  // تحديث formData بحيث يظهر اسم المدينة المختارة
                  setFormData((prev) => ({ ...prev, city: selectedCity.name }));
                }
              }}
              className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
            >
              <option value="" disabled>
                Select a City
              </option>
              {city.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
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
              value={formData.area}
              onChange={handleChange}
              className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
            >
              <option value="" disabled>
                Select a Area
              </option>
              {area.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Branch Name"
            id="branchName"
            type="text"
            value={formData.branchName}
            onChange={handleChange}
          />
          <InputField
            label="Branch Code"
            id="branchCode"
            type="text"
            value={formData.branchCode}
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

          <div
            style={{ height: "420px" }}
            ref={mapRef}
            className="col-span-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-16 py-2 bg-[#de8945] text-lg text-white rounded-md font-semibold w-full col-span-2"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </main>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange }) => (
  <div>
    <label className="block font-medium text-gray-600" htmlFor={id}>
      {label} *
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="input mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#17a3d7] focus:outline-none"
    />
  </div>
);

export default AddBranchPage;

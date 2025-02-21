"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const center = { lat: 25.276987, lng: 55.296249 };

const MapPage = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstance = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // State to store the selected branch
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const router = useRouter();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = Cookies.get("luxamToken");
        const response = await axios.get(`${apiUrl}/get_company_branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        setBranches(response.data || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyDigy7JFuzq8xNoKdQf8hsYWL3bi-QPfZA",
        version: "weekly",
        libraries: ["places"],
      });

      const { Map } = await loader.importLibrary("maps");
      const { Marker } = await loader.importLibrary("marker");

      const map = new Map(mapRef.current, {
        center,
        zoom: 12,
        mapId: "MY_NEXTJS_MAPID",
      });

      mapInstance.current = map;

      markerRef.current = new Marker({
        map,
        position: center,
      });

      const geocoder = new google.maps.Geocoder();

      const updateSearchTerm = (location) => {
        geocoder.geocode({ location }, (results, status) => {
          if (status === "OK" && results[0]) {
            setSearchTerm(results[0].formatted_address);
          }
        });
      };

      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerRef.current.setPosition({ lat, lng });
        updateSearchTerm({ lat, lng });
      });

      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value;
        geocoder.geocode({ address: searchTerm }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            markerRef.current.setPosition(location);
            map.setCenter(location);
          }
        });
      });
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const { Marker } = google.maps;

    branches.forEach((branch) => {
      const lat = parseFloat(branch?.address?.latitude);
      const lng = parseFloat(branch?.address?.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Create a custom SVG label with branch name
   const svgLabel = (branchName) => `
  <svg width="140" height="209" viewBox="0 0 140 209" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="66" cy="156" r="53" fill="#EF3826" fill-opacity="0.5"/>
    <circle cx="66" cy="156" r="32.3171" fill="#EF3826"/>
    <path d="M78.131 160.024C79.1882 158.039 79.7391 155.825 79.7347 153.576C79.7347 145.991 73.5856 139.842 66 139.842C58.4143 139.842 52.2652 145.991 52.2652 153.576C52.2595 156.816 53.4048 159.953 55.4969 162.427L55.5131 162.447L55.5276 162.464H55.4969L63.6473 171.117C63.9494 171.437 64.314 171.693 64.7185 171.867C65.123 172.042 65.559 172.132 65.9996 172.132C66.4402 172.132 66.8761 172.042 67.2807 171.867C67.6852 171.693 68.0497 171.437 68.3518 171.117L76.503 162.464H76.4723L76.4852 162.448L76.4869 162.447C76.545 162.377 76.6029 162.307 76.6606 162.237C77.2211 161.548 77.7136 160.807 78.131 160.024ZM66.004 158.827C64.7184 158.827 63.4854 158.316 62.5763 157.407C61.6672 156.498 61.1565 155.265 61.1565 153.98C61.1565 152.694 61.6672 151.461 62.5763 150.552C63.4854 149.643 64.7184 149.132 66.004 149.132C67.2897 149.132 68.5227 149.643 69.4318 150.552C70.3408 151.461 70.8516 152.694 70.8516 153.98C70.8516 155.265 70.3408 156.498 69.4318 157.407C68.5227 158.316 67.2897 158.827 66.004 158.827Z" fill="#FAFAFA"/>
    <g filter="url(#filter0_d_2198_86)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M4 0.23877C2.89543 0.23877 2 1.1342 2 2.23877V76.7003C2 77.8049 2.89543 78.7003 4 78.7003H56.3102L73.9231 94.6586L91.5359 78.7003H136C137.105 78.7003 138 77.8049 138 76.7003V2.23877C138 1.1342 137.105 0.23877 136 0.23877H4Z" fill="#DE8945"/>
    </g>
    <text x="70" y="40" font-size="16" font-family="Arial" font-weight="bold" fill="black" text-anchor="middle">${branchName.length> 15 ? branchName.slice(0,13)+'...':branchName}</text>
    <defs>
      <filter id="filter0_d_2198_86" x="0" y="0.23877" width="140" height="99.4198" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2198_86"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2198_86" result="shape"/>
      </filter>
    </defs>
  </svg>
`;


        // Convert SVG to data URL
        // const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgLabel(selectedBranch.branch_name))}`;

        const marker = new Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgLabel(branch.branch_name))}`,
            scaledSize: new google.maps.Size(140, 100),
          },
        });
        

        // Add click event to show branch details in a dialog
        marker.addListener("click", () => {
          setSelectedBranch(branch); // Set the selected branch
          setIsDialogOpen(true); // Open the dialog
        });
      } else {
        console.warn("Invalid coordinates for branch:", branch);
      }
    });
  }, [branches]);

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedBranch(null);
  };

  // Function to navigate to the branch's location on the map
  const navigateToBranchOnMap = () => {
    if (selectedBranch && mapInstance.current) {
      const lat = parseFloat(selectedBranch.address.latitude);
      const lng = parseFloat(selectedBranch.address.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        mapInstance.current.setCenter(position); // Center the map on the branch's location
        markerRef.current.setPosition(position); // Update the marker's position
        closeDialog(); // Close the dialog
      } else {
        console.warn("Invalid coordinates for branch:", selectedBranch);
      }
    }
  };

  return (
    <div className="p-5 flex flex-col items-center space-y-4 w-full">
      <div className="w-full h-[85vh] flex flex-col items-center space-y-4">
        <input
          id="searchInput"
          type="text"
          placeholder="Search for a place..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 text-lg rounded-md shadow-sm border border-gray-300 w-full"
        />
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg shadow-lg border"
        />
      </div>

      {/* Dialog for Branch Details */}
      {isDialogOpen && selectedBranch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{selectedBranch.branch_name}</h2>
            <div className="space-y-2">
              <p><strong>Branch Code:</strong> {selectedBranch.branch_code}</p>
              <p><strong>Area:</strong> {selectedBranch.area}</p>
              <p><strong>Address:</strong> {selectedBranch.address.address}</p>
             {selectedBranch.company_name && <p><strong>Company:</strong> {selectedBranch.company_name}</p>}
              {selectedBranch.address.image && (
                <img
                  src={selectedBranch.address.image}
                  alt="Branch Image"
                  className="w-full h-auto rounded-md"
                />
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={navigateToBranchOnMap}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Map Preview
              </button>
              <button
                onClick={() => router.push(`/admin/companiesBranches/update/${selectedBranch.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Edit Branch
              </button>
              <button
                onClick={closeDialog}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
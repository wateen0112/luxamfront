"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const MapSchedules = ({ setCoordinates }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const inputRef = useRef(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyDigy7JFuzq8xNoKdQf8hsYWL3bi-QPfZA",
        version: "weekly",  
        libraries: ["places"],
      });

      const { Map } = await loader.importLibrary("maps");
      const { Marker } = await loader.importLibrary("marker");

      const center = { lat: 25.2048, lng: 55.2708 };

      const map = new Map(mapRef.current, {
        center: center,
        zoom: 12,
        mapId: "MY_NEXTJS_MAPID",
      });

      markerRef.current = new Marker({
        map: map,
        position: center,
        draggable: true,
      });

      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerRef.current.setPosition({ lat, lng });

        setCoordinates({ latitude: lat, longitude: lng });
      });

      const autocompleteService = new google.maps.places.AutocompleteService();
      const placesService = new google.maps.places.PlacesService(map);

      const handleSearch = (query) => {
        if (!query) return;

        autocompleteService.getPlacePredictions(
          { input: query },
          (predictions, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions.length > 0
            ) {
              const placeId = predictions[0].place_id;
              placesService.getDetails({ placeId }, (place, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  place.geometry
                ) {
                  const location = place.geometry.location;
                  map.setCenter(location);
                  markerRef.current.setPosition(location);

                  setCoordinates({
                    latitude: location.lat(),
                    longitude: location.lng(),
                  });
                }
              });
            }
          }
        );
      };

      inputRef.current.addEventListener("input", (e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
      });
    };

    initMap();
  }, []);

  return (
    <div className="w-full flex flex-col items-center mb-12">
      {/* مربع البحث خارج الخريطة */}
      <div className="w-full mb-4">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a place..."
          className="input"
        />
      </div>

      {/* الخريطة */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md border border-gray-300">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapSchedules;

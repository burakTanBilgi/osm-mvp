"use client";
import React, { useState, useEffect, useRef, FC } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import ChatSidebar from "./ChatSidebar";

// Define the interface for MarkerData
interface MarkerData {
  coordinates: [number, number];
  title: string;
}

// Loader component for showing loading animation
const Loader = () => {
  return (
    <div className="absolute z-[10000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <svg
        aria-hidden="true"
        className="w-24 h-24 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
};

// Main component
const MapComponent: FC = () => {
  // Initialize local state
  const [inputValue, setInputValue] = useState<string>("");
  const [markerData, setMarkerData] = useState<MarkerData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  
  // Declare useRef to reference map
  const mapRef = useRef<any | null>(null);

  // ZoomHandler component for handling map zoom events
  const ZoomHandler: FC = () => {
    // Use Leaflet's useMap hook
    const map = useMap();
    
    // Function to fly map to given coordinates
    const flyToMarker = (coordinates: [number, number], zoom: number) => {
      if (coordinates && typeof coordinates[0] !== "undefined") {
        map.flyTo(coordinates, zoom, {
          animate: true,
          duration: 1.5,
        });
      }
    };
    
    useMapEvents({
      zoomend: () => {
        setLoading(false);
      },
    });
    
    // useEffect to trigger the map fly when markerData changes
    useEffect(() => {
      if (markerData) {
        if (markerData.coordinates && typeof markerData.coordinates[0] !== "undefined") {
          flyToMarker(markerData.coordinates, 11);
        }
      }
    }, [markerData]);
    
    // Return null as we're not rendering anything in the DOM
    return null;
  };
  
  // Function to handle search request from chat sidebar
  const handleLocationSearch = async (query: string) => {
    setLoading(true);
    try {
      // Set submitted question and clear the input
      setSubmittedQuestion(query);
      setInputValue("");
      
      // Make the API request using fetch
      const response = await fetch("/api/Coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: query }),
      });
      
      // Parse and set the response data
      const data = await response.json();
      setMarkerData(data);
    } catch (error) {
      // Log errors
      console.error(error);
      setLoading(false);
    }
  };
  
  
  // Return the JSX for rendering
  return (
    <>
      {/* Show the loader if loading */}
      {loading && <Loader />}
      
      {/* Conditionally render the title overlay */}
      {markerData && markerData.coordinates && (
        <div className="flex items-center justify-center absolute top-3 right-20 z-[1000]">
          <h1 className="text-3xl font-bold text-black p-2 bg-white rounded-md">{markerData.title}</h1>
        </div>
      )}
      
      {/* Add the map container */}
      <MapContainer center={[43.6426, -79.3871]} zoom={11} style={{ height: "100vh", width: "100vw" }}>
        {/* Set the tile layer for the map */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Conditionally render the marker */}
        {markerData && markerData.coordinates && (
          <Marker position={markerData.coordinates}>
            <Popup>{markerData.title}</Popup>
          </Marker>
        )}
        
        {/* Include the ZoomHandler for zoom events */}
        <ZoomHandler />
      </MapContainer>
      
      {/* Add the consolidated chat sidebar */}
      <ChatSidebar 
        onSearchLocation={handleLocationSearch}
        locationName={markerData?.title}
        isLoading={loading}
      />
    </>
  );
};

export default MapComponent;
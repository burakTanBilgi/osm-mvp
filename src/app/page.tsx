"use client";
import dynamic from "next/dynamic";

// Dynamically import MapComponent with SSR disabled
const DynamicMapComponent = dynamic(() => import("./components/MapComponent"), { 
  ssr: false 
});

const MyPage = () => {
  return (
    <div className="relative">
      <DynamicMapComponent />
    </div>
  );
};

export default MyPage;
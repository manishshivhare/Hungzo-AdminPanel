import React, { useState } from "react";
import RestaurantVerifi from "../restaurants/RestaurantVerifi";
import DriversVerifi from "../Drivers/DriversVerifi";

const Verifications = () => {
  const [activeSection, setActiveSection] = useState("restaurant");

  return (
    <div className="min-h-screen bg-[#061D22]">
      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection("restaurant")}
          className={`px-4 py-2 rounded font-medium ${
            activeSection === "restaurant"
              ? "bg-white text-amber-700"
              : "bg-amber-600 text-white"
          }`}
        >
          Restaurant Verification
        </button>

        <button
          onClick={() => setActiveSection("driver")}
          className={`px-4 py-2 rounded font-medium ${
            activeSection === "driver"
              ? "bg-white text-amber-700"
              : "bg-amber-600 text-white"
          }`}
        >
          Driver Verification
        </button>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg p-2 shadow">
        {activeSection === "restaurant" && <RestaurantVerifi />}
        {activeSection === "driver" && <DriversVerifi />}
      </div>
    </div>
  );
};

export default Verifications;

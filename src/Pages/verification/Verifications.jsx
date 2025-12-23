import React, { useState } from "react";
import RestaurantVerifi from "../restaurants/RestaurantPending";
import DriversVerifi from "../Drivers/DriversPendding";

const Verifications = () => {
  const [activeSection, setActiveSection] = useState("restaurant");

  return (
    <div className="min-h-screen ">
      {/* Buttons */}
      <div className="flex gap-4 m-6 ">
        <button
          onClick={() => setActiveSection("restaurant")}
          className={`px-4 py-2 rounded font-medium ${
            activeSection === "restaurant"
              ? "bg-amber-600 text-white"
              : "bg-white text-amber-700"
          }`}
        >
          Restaurant Verification
        </button>

        <button
          onClick={() => setActiveSection("driver")}
          className={`px-4 py-2 rounded font-medium ${
            activeSection === "driver"
              ?"bg-amber-600 text-white"
              :  "bg-white text-amber-700"
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

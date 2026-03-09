import React, { useState } from "react";
import CommissionsTsC from "./CommissionsTsC";
import RestaurantTandC from "./RestaurantTandC";
import DeliveryFeesRules from "./DeliveryFeesRules";

const Rules = () => {
  const [activeTab, setActiveTab] = useState("commission");

  const tabs = [
    { id: "commission", label: "Commission", component: <CommissionsTsC /> },
    { id: "restaurant", label: "Restaurant", component: <RestaurantTandC /> },
    { id: "delivery", label: "Delivery Fee", component: <DeliveryFeesRules /> },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* NAV - Modern Tab Design */}
      <div className="px-6 pt-6">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-colors duration-200
                ${activeTab === tab.id 
                  ? "text-blue-600" 
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg p-4 border border-slate-100">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default Rules;
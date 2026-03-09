import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import RestaurantVerifi from "./RestaurantPending";
import RestaurantApproved from "./RestaurantApproved";
import RestaurantRejectes from "./RestaurantRejectes";

const TABS = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle,
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
  },
];

const Restaurants = () => {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="p-1 py-3 space-y-2">
      {/* ================= TABS ================= */}
      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                ${
                  isActive
                    ? "bg-[#061D22] text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="bg-white rounded-xl shadow-sm border">
        {activeTab === "pending" && <RestaurantVerifi />}
        {activeTab === "approved" && <RestaurantApproved />}
        {activeTab === "rejected" && <RestaurantRejectes />}
      </div>
    </div>
  );
};

export default Restaurants;

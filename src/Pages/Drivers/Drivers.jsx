import React, { useState } from "react";
import DriverList from "./DriverList";
import DriverRejected from "./DriverRejected";
import DriversVerifi from "./DriversPendding";
import { Users, AlertCircle, XCircle, CheckCircle } from "lucide-react";

const TABS = [
  {
    id: "approved",
    label: "Approved Drivers",
    icon: CheckCircle,
    active: "text-green-600 border-green-600",
    indicator: "bg-green-600",
    button: "bg-green-600 text-white",
    hover: "hover:text-green-700",
  },
  {
    id: "pending",
    label: "Pending Drivers",
    icon: AlertCircle,
    active: "text-yellow-600 border-yellow-500",
    indicator: "bg-yellow-500",
    button: "bg-yellow-500 text-white",
    hover: "hover:text-yellow-700",
  },
  {
    id: "rejected",
    label: "Rejected Drivers",
    icon: XCircle,
    active: "text-red-600 border-red-600",
    indicator: "bg-red-600",
    button: "bg-red-600 text-white",
    hover: "hover:text-red-700",
  },
];

const Drivers = () => {
  const [activeTab, setActiveTab] = useState("approved");

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ===== Header ===== */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Driver Management
            </h1>
            <p className="text-sm text-slate-500">
              Review, approve and manage drivers
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Last updated: just now
        </span>
      </div>

      {/* ===== Top Pills Tabs ===== */}
      <div className="flex gap-3 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border
                ${
                  isActive
                    ? `${tab.button} border-transparent shadow-md`
                    : `bg-white text-slate-600 border-slate-200 hover:bg-slate-100`
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== Main Card ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

        {/* ===== Content ===== */}
        <div className="p-4 py-3">
          {activeTab === "approved" && <DriverList />}
          {activeTab === "pending" && <DriversVerifi />}
          {activeTab === "rejected" && <DriverRejected />}
        </div>
      </div>
    </div>
  );
};

export default Drivers;

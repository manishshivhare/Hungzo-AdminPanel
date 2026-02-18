import React, { useState } from "react";
import LiveOrder from "./LiveOrder";
import OrderHistory from "./OrderHistory";
import { useAuth } from "../../Context/AuthProvider";
import OrderReturn from "./OrderReturn";

/* 🔔 Sound */
const playNewOrderSound = () => {
  const audio = new Audio("/sounds/new-order.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
};

const OrdersPage = () => {
  const { user } = useAuth();

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("live");

  if (!user) {
    return (
      <div className="p-6 text-gray-500">
        Loading user permissions...
      </div>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b px-6 py-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">🍔 Orders</h1>

          {/* ================= TABS ================= */}
          <div className="flex gap-3 mt-2">
            <TabButton
              active={activeTab === "live"}
              onClick={() => setActiveTab("live")}
              label="Live Orders"
            />

            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              label="Order History"
            />
            
            {/* FIXED: Changed from "Return" to "return" to match state */}
            <TabButton
              active={activeTab === "return"}
              onClick={() => setActiveTab("return")}
              label="Order Return"
            />
          </div>
        </div>

        {/* 🔔 SOUND TOGGLE (OPTIONAL) */}
        
        <button
          onClick={() => {
            setSoundEnabled((prev) => !prev);
            playNewOrderSound();
          }}
          className={`px-4 py-2 rounded text-sm font-medium ${
            soundEnabled
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          🔔 Sound {soundEnabled ? "On" : "Off"}
        </button>
       
      </header>

      {/* ================= CONTENT ================= */}
      <div className="px-2">
        {activeTab === "live" && (
          <LiveOrder soundEnabled={soundEnabled} />
        )}

        {activeTab === "history" && <OrderHistory />}
        {activeTab === "return" && <OrderReturn />}
      </div>
    </>
  );
};

/* ================= TAB BUTTON ================= */
const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded text-sm font-medium transition ${
      active
        ? "bg-blue-600 text-white"
        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }`}
  >
    {label}
  </button>
);

export default OrdersPage;
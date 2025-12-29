import React, { useState } from "react";
import LiveOrder from "./LiveOrder";
import OrderHistory from "./OrderHistory";
import Transaction from "./Transaction";
import { useAuth } from "../../Context/AuthProvider";
import Dashboard from "./AnalyticsDashboard";

/* 🔔 Sound */
const playNewOrderSound = () => {
  const audio = new Audio("/sounds/new-order.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
};

const OrdersPage = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const { user } = useAuth();

  /* ✅ IMPORTANT: wait until user is available */
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
            <TabButton
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
              label="Analytics"
            />

            {/* 🔐 SUPERADMIN ONLY */}
            {user.role === "SUPERADMIN" && (
              <TabButton
                active={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
                label="💳 Payments"
              />
            )}
          </div>
        </div>

        {/* ================= SOUND TOGGLE ================= */}
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
      <div className="p-2">
        {activeTab === "live" && (
          <LiveOrder soundEnabled={soundEnabled} />
        )}

        {activeTab === "history" && <OrderHistory />}
        {activeTab === "analytics" && <Dashboard />}

        {/* 🔒 HARD PROTECTION */}
        {activeTab === "payments" && user.role === "SUPERADMIN" && (
          <Transaction />
        )}

        {activeTab === "payments" && user.role !== "SUPERADMIN" && (
          <div className="p-6 text-red-600 font-semibold">
            🚫 Unauthorized Access
          </div>
        )}
      </div>
    </>
  );
};

/* ================= REUSABLE TAB BUTTON ================= */
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

import React, { useState } from "react";
import LiveOrder from "./LiveOrder";
import OrderHistory from "./OrderHistory";

// 🔔 sound function
const playNewOrderSound = () => {
  const audio = new Audio("/sounds/new-order.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
};

const OrdersPage = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("live"); // live | history

  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-1 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">🍔 Orders</h1>

          {/* TABS */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                activeTab === "live"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              Live Orders
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              Order History
            </button>
          </div>
        </div>

        {/* SOUND TOGGLE */}
        <button
          onClick={() => {
            setSoundEnabled((prev) => !prev);
            playNewOrderSound(); // unlock browser audio
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

      {/* CONTENT */}
      <div className="p-1">
        {activeTab === "live" ? (
          <LiveOrder soundEnabled={soundEnabled} />
        ) : (
          <OrderHistory />
        )}
      </div>
    </>
  );
};

export default OrdersPage;


import React, { useEffect, useRef, useState } from "react";

// 🔔 sound function
const playNewOrderSound = () => {
  const audio = new Audio("/Alert.wav");
  audio.volume = 0.7;
  audio.play().catch(() => {});
};

// 🍔 DUMMY DATA GENERATOR
const generateDummyOrders = () => {
  const statuses = ["New", "Preparing", "Ready"];
  const itemsList = [
    "Burger + Fries + Coke",
    "Pizza Margherita",
    "Chicken Sandwich Combo",
    "Caesar Salad",
    "Sushi Platter",
    "Pad Thai",
    "Steak with Mashed Potatoes",
    "Vegetable Curry with Rice",
    "Fish and Chips",
    "Pasta Carbonara"
  ];
  
  const customers = ["John D.", "Sarah M.", "Alex T.", "Maria L.", "James B.", "Emma K."];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `ORD${1000 + i}`,
    items: itemsList[Math.floor(Math.random() * itemsList.length)],
    customer: customers[Math.floor(Math.random() * customers.length)],
    status: statuses[Math.floor(Math.random() * 3)],
    time: `${Math.floor(Math.random() * 30) + 1} min ago`,
    total: `$${(Math.random() * 50 + 10).toFixed(2)}`
  }));
};

const LiveOrder = ({ soundEnabled }) => {
  const [orders, setOrders] = useState([]);
  const prevCount = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      const dummyOrders = generateDummyOrders();
      setOrders(dummyOrders);
      prevCount.current = dummyOrders.length;
      setIsConnected(true);
    }, 500);

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { 
        const newOrder = {
          id: `ORD${1000 + orders.length + 1}`,
          items: ["Burger + Fries", "Pizza", "Sushi", "Salad"][Math.floor(Math.random() * 4)],
          customer: ["New Customer", "Returning Guest", "Online Order"][Math.floor(Math.random() * 3)],
          status: "New",
          time: "Just now",
          total: `$${(Math.random() * 40 + 15).toFixed(2)}`
        };
        
        setOrders(prev => {
          const newOrders = [newOrder, ...prev];
          
          if (soundEnabled) {
            playNewOrderSound();
          }
          
          return newOrders;
        });
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const updateStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "New": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Preparing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "New": return "🆕";
      case "Preparing": return "👨‍🍳";
      case "Ready": return "✅";
      default: return "📦";
    }
  };

  // Filter orders by status for better organization
  const newOrders = orders.filter(o => o.status === "New");
  const preparingOrders = orders.filter(o => o.status === "Preparing");
  const readyOrders = orders.filter(o => o.status === "Ready");

  return (
    <div className="min-h-screen bg- from-gray-50 to-gray-100">
      {/* STATS BAR */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Live Orders Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time updates from your restaurant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? `Connected • ${orders.length} orders` : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-3 gap-4 mt-1">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🆕</span>
              <div className="flex items-center justify-center gap-3">
                <p className="text-sm text-yellow-700">New Orders</p>
                <p className="text-2xl font-bold text-yellow-800">{newOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span>
              <div className=" flex items-center justify-center gap-3">
                <p className="text-sm text-blue-700">Preparing</p>
                <p className="text-2xl font-bold text-blue-800">{preparingOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div className="flex items-center justify-center gap-3">
                <p className="text-sm text-green-700">Ready</p>
                <p className="text-2xl font-bold text-green-800">{readyOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS GRID - ORGANIZED BY STATUS */}
      <div className="space-y-8 h-[65vh] overflow-y-auto">
        {/* NEW ORDERS SECTION */}
        {newOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-gray-800">🆕 New Orders</h3>
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                {newOrders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {newOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  updateStatus={updateStatus}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* PREPARING ORDERS SECTION */}
        {preparingOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-gray-800">👨‍🍳 Preparing</h3>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {preparingOrders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {preparingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  updateStatus={updateStatus}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* READY ORDERS SECTION */}
        {readyOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-gray-800">✅ Ready for Pickup</h3>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {readyOrders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {readyOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  updateStatus={updateStatus}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ORDER CARD COMPONENT
const OrderCard = ({ order, updateStatus, getStatusColor, getStatusIcon }) => (
  <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    {/* ORDER HEADER */}
    <div className="p-4 border-b">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">#</span>
            <h3 className="font-bold text-gray-800">{order.id}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">👤</span>
            <span className="text-sm text-gray-700">{order.customer}</span>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)} {order.status}
        </span>
      </div>

      {/* ORDER TIME */}
      <div className="mt-3 flex items-center text-xs text-gray-500">
        <span>🕒 {order.time}</span>
        <span className="mx-2">•</span>
        <span className="font-medium text-gray-700">{order.total}</span>
      </div>
    </div>

    {/* ORDER ITEMS */}
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="bg-gray-100 p-2 rounded-lg">
          <span className="text-lg">🍔</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-800 font-medium">{order.items}</p>
          <p className="text-xs text-gray-500 mt-1">1x items</p>
        </div>
      </div>
    </div>

    {/* ACTIONS */}
    <div className="p-4 border-t bg-gray-50 rounded-b-xl">
      {order.status === "New" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateStatus(order.id, "Preparing")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
          >
            <span>👨‍🍳</span> Start Prep
          </button>
          <button
            onClick={() => updateStatus(order.id, "Ready")}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
          >
            <span>⚡</span> Mark Ready
          </button>
        </div>
      )}
      
      {order.status === "Preparing" && (
        <button
          onClick={() => updateStatus(order.id, "Ready")}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>✅</span> Mark as Ready
          <span className="text-xs opacity-90">({order.time})</span>
        </button>
      )}
      
      {order.status === "Ready" && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700 font-medium">✅ Ready for pickup</span>
          <button
            onClick={() => updateStatus(order.id, "New")}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Re-open
          </button>
        </div>
      )}
    </div>
  </div>
);

export default LiveOrder;
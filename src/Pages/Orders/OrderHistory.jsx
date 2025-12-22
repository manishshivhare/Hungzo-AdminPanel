import React, { useState } from 'react';

/* ================= DATE HELPER ================= */
const getRandomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

/* ================= DUMMY HISTORY DATA ================= */
const generateHistoryData = () => {
  const statuses = ["Completed", "Cancelled", "Refunded"];
  const itemsList = [
    "Burger + Fries + Coke",
    "Pizza Margherita",
    "Chicken Sandwich Combo",
    "Caesar Salad",
    "Sushi Platter",
    "Pad Thai"
  ];

  const customers = ["John D.", "Sarah M.", "Alex T.", "Maria L.", "James B.", "Emma K."];
  const times = ["12:30 PM", "1:15 PM", "6:45 PM", "8:20 PM", "11:10 AM"];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `HIST${8000 + i}`,
    items: itemsList[Math.floor(Math.random() * itemsList.length)],
    customer: customers[Math.floor(Math.random() * customers.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: getRandomDate(),              // ✅ FIXED DATE
    time: times[Math.floor(Math.random() * times.length)],
    total: `$${(Math.random() * 50 + 10).toFixed(2)}`,
    payment: ["Credit Card", "Cash", "PayPal", "Apple Pay"][Math.floor(Math.random() * 4)]
  }));
};

const OrderHistory = () => {
  const [orders] = useState(generateHistoryData());
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FILTER ================= */
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* ================= DOWNLOAD ALL CSV (LOGIC ONLY) ================= */
  const downloadAllOrdersCSV = () => {
    if (!filteredOrders.length) return;

    const headers = [
      "Order ID",
      "Customer",
      "Items",
      "Status",
      "Date",
      "Time",
      "Total",
      "Payment Method"
    ];

    const rows = filteredOrders.map(o => [
      o.id,
      o.customer,
      o.items,
      o.status,
      o.date,
      o.time,
      o.total,
      o.payment
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map(row => row.map(item => `"${item}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "all_orders.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= STATUS UI ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Refunded": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return "✅";
      case "Cancelled": return "❌";
      case "Refunded": return "🔄";
      default: return "📦";
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === "Completed")
      .reduce((sum, order) => sum + parseFloat(order.total.replace('$', '')), 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b-from-gray-50 to-gray-100">

      {/* ================= HEADER (UI SAME) ================= */}
      <div className="bg-white rounded-lg shadow-sm p-1 mb-2">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800">📊 Order History</h2>
            <p className="text-gray-600 mt-1">View past orders and transactions</p>
          </div>

          {/* 🔥 BUTTON ADDED (NO UI BREAK) */}
          <button
            onClick={downloadAllOrdersCSV}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ⬇ Download All
          </button>
        </div>
        {/* FILTERS AND SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders by ID, customer, or items..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ✅ Completed
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ❌ Cancelled
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div className="bg-white border p-4 rounded-lg flex items-center gap-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white border px-4 rounded-lg flex items-center gap-2 justify-center">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === "Completed").length}
            </p>
          </div>
          <div className="bg-white border px-4 rounded-lg flex items-center gap-2 justify-center">
            <p className="text-sm text-gray-600">Total Order Value</p>
            <p className="text-2xl font-bold">
              ${getTotalRevenue()}
            </p>
          </div>
          <div className="bg-white border px-4 rounded-lg flex items-center gap-2 justify-center">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold">
              {((orders.filter(o => o.status === "Completed").length / orders.length) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-xl shadow-sm h-[59vh] overflow-y-auto">
        <div className="">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 h-[10vh] overflow-y-auto">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-1">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500 mt-1">{order.items}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        👤
                      </div>
                      <span className="text-gray-900">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{order.date}</p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{order.total}</span>
                    <p className="text-xs text-gray-500 mt-1">{order.payment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      {/* SUMMARY */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold text-gray-800 mb-4">📈 Popular Items</h4>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>🍔 Burgers</span>
              <span className="font-bold">42 orders</span>
            </li>
            <li className="flex justify-between">
              <span>🍕 Pizza</span>
              <span className="font-bold">38 orders</span>
            </li>
            <li className="flex justify-between">
              <span>🥗 Salads</span>
              <span className="font-bold">24 orders</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold text-gray-800 mb-4">⏰ Peak Hours</h4>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>12:00 PM - 1:00 PM</span>
              <span className="font-bold text-green-600">28 orders</span>
            </li>
            <li className="flex justify-between">
              <span>6:00 PM - 7:00 PM</span>
              <span className="font-bold text-green-600">31 orders</span>
            </li>
            <li className="flex justify-between">
              <span>8:00 PM - 9:00 PM</span>
              <span className="font-bold text-green-600">19 orders</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold text-gray-800 mb-4">💳 Payment Methods</h4>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>Credit Card</span>
              <span className="font-bold">65%</span>
            </li>
            <li className="flex justify-between">
              <span>Digital Wallet</span>
              <span className="font-bold">25%</span>
            </li>
            <li className="flex justify-between">
              <span>Cash</span>
              <span className="font-bold">10%</span>
            </li>
          </ul>
        </div>
      </div>
      </div>

    </div>
  );
};

export default OrderHistory;
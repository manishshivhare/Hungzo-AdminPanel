import React from "react";

const stats = [
  { title: "Total Users", value: "12,450", color: "bg-blue-500" },
  { title: "Total Orders", value: "3,280", color: "bg-green-500" },
  { title: "Revenue", value: "₹1,25,000", color: "bg-purple-500" },
  { title: "Growth", value: "+18%", color: "bg-orange-500" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl p-5 text-white shadow ${item.color}`}
          >
            <p className="text-sm opacity-80">{item.title}</p>
            <h2 className="text-2xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Box 1 */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-4">User Growth</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed rounded">
            Chart UI Placeholder
          </div>
        </div>

        {/* Chart Box 2 */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-4">Revenue Overview</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed rounded">
            Chart UI Placeholder
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
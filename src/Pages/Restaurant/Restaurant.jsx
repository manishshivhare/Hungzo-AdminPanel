// import React, { useState } from "react";
// import {
//   CheckCircle,
//   XCircle,
//   Clock,
// } from "lucide-react";
// import RestaurantVerifi from "../Restaurants/RestaurantPending";
// import RestaurantApproved from "../Restaurants/RestaurantApproved";
// import RestaurantRejectes from "../Restaurants/RestaurantRejectes";
// import OnlyLoggedUser from "./OnlyLoggedUser";

// const TABS = [
//   {
//     key: "pending",
//     label: "Pending",
//     icon: Clock,
//   },
//   {
//     key: "approved",
//     label: "Approved",
//     icon: CheckCircle,
//   },
//   {
//     key: "rejected",
//     label: "Rejected",
//     icon: XCircle,
//   },

// ];

// const Restaurant = () => {
//   const [activeTab, setActiveTab] = useState("pending");

//   return (
//     <div className="p-1 py-3 space-y-2">
//       {/* ================= TABS ================= */}
//       <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border w-fit">
//         {TABS.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = activeTab === tab.key;

//           return (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
//                 ${
//                   isActive
//                     ? "bg-[#061D22] text-white shadow"
//                     : "text-slate-600 hover:bg-slate-100"
//                 }`}
//             >
//               <Icon size={16} />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* ================= CONTENT ================= */}
//       <div className="bg-white rounded-xl shadow-sm border">
//         {activeTab === "pending" && <RestaurantVerifi />}
//         {activeTab === "approved" && <RestaurantApproved />}
//         {activeTab === "rejected" && <RestaurantRejectes />}
//         {activeTab === "logged" && <OnlyLoggedUser />}
//       </div>
//     </div>
//   );
// };

// export default Restaurant;




// New Updates this is for Users Page

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  restaurantOnlyLogged,
  rejectRestaurantReq,
} from "../../Api";
import { X, XCircle, Wallet, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";

const Restaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  // ================= FETCH =================
  const fetchLoggedRestaurants = async () => {
    try {
      const res = await restaurantOnlyLogged();

      const data = res?.users || res?.data?.users || [];

      // ✅ Only RESTAURANT role
      const onlyRestaurants = data.filter(
        (user) => user.role === "RESTAURANT"
      );

      // ✅ Sort latest first
      const sorted = [...onlyRestaurants].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRestaurants(sorted);
    } catch {
      toast.error("Failed to load logged users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoggedRestaurants();
  }, []);

  // ================= REJECT (optional) =================
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectRestaurantReq(id);
      toast.success("User blocked ❌");
      setSelectedRestaurant(null);
      fetchLoggedRestaurants();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= SEARCH =================
  const filteredRestaurants = restaurants.filter((user) =>
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone || "").includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[83vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Users
            </h1>
            <p className="text-gray-500 text-sm">
              Manage logged-in restaurant users
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{restaurants.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm border h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr className="text-xs uppercase tracking-wide text-gray-600">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Joined On</th>
              <th className="px-6 py-4 text-center">Details</th>
              <th className="px-6 py-4 text-center">Wallet</th>
              <th className="px-6 py-4 text-center">Orders</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((res, index) => (
                <tr
                  key={res._id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {res.name || "—"}
                  </td>

                  <td className="px-6 py-4">
                    {res.email || "—"}
                  </td>

                  <td className="px-6 py-4">
                    {res.phone || "—"}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(res.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedRestaurant(res)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                    >
                      <Eye size={18} />
                    </button>
                  </td>

                  {/* Wallet */}
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/wallet/${res._id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                    >
                      <Wallet size={18} />
                    </Link>
                  </td>
                  {/* Orders */}
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/orders/user/${res._id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600"
                      title="View Orders"
                    >
                      📦
                    </Link>
                  </td>

                  {/* Optional Action */}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isSuperAdmin ? 8 : 7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {selectedRestaurant.name || "User"}
            </h2>

            <div className="space-y-3">
              <p><b>Email:</b> {selectedRestaurant.email || "—"}</p>
              <p><b>Phone:</b> {selectedRestaurant.phone || "—"}</p>
              <p><b>Role:</b> {selectedRestaurant.role}</p>
              <p>
                <b>Created At:</b>{" "}
                {new Date(selectedRestaurant.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Link
                to={`/wallet/${selectedRestaurant._id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                View Wallet
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  restaurantApproved,
  rejectRestaurantReq,
} from "../../Api";
import { User, X, MapPin, XCircle, Wallet, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";

const RestaurantApproved = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  // ================= FETCH =================
  const fetchApprovedRestaurants = async () => {
    try {
      const res = await restaurantApproved();
      if (res?.ok !== false) {
        const data = res.data || res;

        // ✅ NEWEST FIRST (by updatedAt)
        const sorted = [...data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setRestaurants(sorted);
      }
    } catch {
      toast.error("Failed to load approved restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRestaurants();
  }, []);

  // ================= REJECT =================
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectRestaurantReq(id);
      toast.success("Restaurant rejected ❌");
      setSelectedRestaurant(null);
      fetchApprovedRestaurants();
    } catch {
      toast.error("Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= SEARCH =================
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.owner?.phone && restaurant.owner.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[83vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approved restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approved Restaurants</h1>
            <p className="text-gray-600 mt-1">Manage approved restaurant listings</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {restaurants.length} restaurants
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by restaurant name or phone..."
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm border h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr className="text-xs uppercase tracking-wide text-gray-600">
              <th className="px-6 py-4 text-left">Restaurant</th>
              <th className="px-6 py-4 text-left">Owner</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Approved On</th>
              <th className="px-6 py-4 text-center">Details</th>
              <th className="px-6 py-4 text-center">Wallet</th>
              {isSuperAdmin && (
                <th className="px-6 py-4 text-center">Actions</th>
              )}
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
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{res.name}</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Approved
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-gray-700">{res.ownerName || "—"}</p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-gray-700">{res.owner?.phone || "—"}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-gray-700">
                      <p>{new Date(res.updatedAt).toLocaleDateString("en-IN")}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(res.updatedAt).toLocaleTimeString("en-IN")}
                      </p>
                    </div>
                  </td>

                  {/* View Details Button */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedRestaurant(res)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>

                  {/* Wallet Button */}
                  <td className="px-6 py-4 text-center">
                    {/* {console.log(res.owner._id)} */}    
                    <Link
                      to={`/wallet/${res.owner._id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                      title="View Wallet"
                    >
                      <Wallet size={18} />
                    </Link>
                  </td>

                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-center">
                      <button
                        disabled={actionLoading === res._id}
                        onClick={() => handleReject(res._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={16} />
                        {actionLoading === res._id
                          ? "Blocking..."
                          : "Block Restaurant"}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="mt-3 text-lg font-medium">No restaurants found</p>
                    <p className="mt-1 text-sm">
                      {searchTerm ? "Try a different search term" : "No approved restaurants yet"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedRestaurant.name}</h2>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              ✅ Approved
            </span>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedRestaurant.verificationStatus || "Approved"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className={`font-medium ${selectedRestaurant.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRestaurant.isActive ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">FSSAI</p>
                    <p className="font-medium">{selectedRestaurant.fssai || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST</p>
                    <p className="font-medium">{selectedRestaurant.gst || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Owner Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedRestaurant.ownerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedRestaurant.owner?.phone || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Timestamps</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                      {new Date(selectedRestaurant.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved/Updated At</p>
                    <p className="font-medium">
                      {new Date(selectedRestaurant.updatedAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedRestaurant.addresses?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                    <MapPin size={18} /> Address
                  </h3>
                  <div className="space-y-4">
                    {selectedRestaurant.addresses.map((addr, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        {addr.label && (
                          <p className="font-medium text-gray-700 mb-1">{addr.label}</p>
                        )}
                        <p className="text-gray-600">{addr.line1}</p>
                        {addr.line2 && <p className="text-gray-600">{addr.line2}</p>}
                        <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link
                  to={`/wallet/${selectedRestaurant._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Wallet size={16} />
                  View Wallet
                </Link>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantApproved;
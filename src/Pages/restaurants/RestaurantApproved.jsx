import React, { useEffect, useState } from "react";
import {
  restaurantApproved,
  rejectRestaurantReq,
} from "../../Api";
import { User, X, MapPin, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";

const RestaurantApproved = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

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

  if (loading) {
    return (
      <div className="p-6 text-slate-500 text-sm">
        Loading approved restaurants…
      </div>
    );
  }

  return (
    <>
      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm border h-[83vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b sticky top-0 z-10">
            <tr className="text-xs uppercase tracking-wide text-slate-600">
              <th className="px-6 py-4 text-left">Restaurant</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Approved On</th>
              <th className="px-6 py-4 text-center">View</th>
              {isSuperAdmin && (
                <th className="px-6 py-4 text-center">Action</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {restaurants.map((res, index) => (
              <tr
                key={res._id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-slate-100`}
              >
                <td className="px-6 py-4">
                  <p className="font-medium">{res.name}</p>
                  <span className="text-xs text-green-600">Approved</span>
                </td>

                <td className="px-6 py-4">
                  {res.owner?.phone || "—"}
                </td>

                <td className="px-6 py-4">
                  {new Date(res.updatedAt).toLocaleDateString("en-IN")}
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setSelectedRestaurant(res)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300"
                  >
                    <User size={16} />
                  </button>
                </td>

                {isSuperAdmin && (
                  <td className="px-6 py-4 text-center">
                    <button
                      disabled={actionLoading === res._id}
                      onClick={() => handleReject(res._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      {actionLoading === res._id
                        ? "Blocking..."
                        : "Block"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 relative">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-5">
              ✅ Approved Restaurant Details
            </h2>

            <div className="space-y-3 text-sm text-slate-700">
              <p><b>Restaurant Name:</b> {selectedRestaurant.name}</p>
              <p><b>Status:</b> {selectedRestaurant.verificationStatus}</p>
              <p><b>Active:</b> {selectedRestaurant.isActive ? "Yes" : "No"}</p>

              <hr />
              <p className="font-semibold">Owner Details</p>
              <p><b>Name:</b> {selectedRestaurant.ownerName}</p>
              <p><b>Phone:</b> {selectedRestaurant.owner?.phone}</p>

              <hr />
              <p><b>FSSAI:</b> {selectedRestaurant.fssai || "N/A"}</p>
              <p><b>GST:</b> {selectedRestaurant.gst || "N/A"}</p>

              <p>
                <b>Created:</b>{" "}
                {new Date(selectedRestaurant.createdAt).toLocaleString("en-IN")}
              </p>
              <p>
                <b>Approved On:</b>{" "}
                {new Date(selectedRestaurant.updatedAt).toLocaleString("en-IN")}
              </p>

              <hr />
              <p className="font-semibold flex items-center gap-1">
                <MapPin size={16} /> Address
              </p>

              {selectedRestaurant.addresses?.map((addr, i) => (
                <p key={i} className="ml-5">
                  {addr.label && <b>{addr.label}: </b>}
                  {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantApproved;

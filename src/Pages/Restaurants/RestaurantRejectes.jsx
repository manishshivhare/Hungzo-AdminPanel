import React, { useEffect, useState } from "react";
import {
  restaurantRejected,
  approveRestaurantReq,
} from "../../Api";
import { User, X, MapPin, WalletMinimal } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";
import { Link } from "react-router-dom";

const RestaurantRejectes = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ================= FETCH =================
  const fetchRejectedRestaurants = async () => {
    try {
      const res = await restaurantRejected();
      if (res?.ok !== false) {
        const data = res.data || res;

        // ✅ NEWEST FIRST (by updatedAt)
        const sorted = [...data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setRestaurants(sorted);
      }
    } catch {
      toast.error("Failed to load rejected restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedRestaurants();
  }, []);

  // ================= RE-APPROVE =================
  const handleReApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await approveRestaurantReq(id);
      if (res?.ok === false) {
        toast.error(res.message);
        return;
      }
      toast.success("Restaurant re-approved ✅");
      setSelectedRestaurant(null);
      fetchRejectedRestaurants();
    } catch {
      toast.error("Re-approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-500 text-sm">
        Loading rejected restaurants…
      </div>
    );
  }

  return (
    <>
      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm border h-[83vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b sticky top-0 z-10">
            <tr className="text-xs uppercase text-slate-500">
              <th className="px-5 py-4 text-left">Restaurant</th>
              <th className="px-5 py-4 text-left">Owner</th>
              <th className="px-5 py-4">FSSAI</th>
              <th className="px-5 py-4">GST</th>
              <th className="px-5 py-4">Rejected On</th>
              <th className="px-5 py-4 text-center">View</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  No rejected restaurants
                </td>
              </tr>
            ) : (
              restaurants.map((res) => (
                <tr
                  key={res._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {res.name}
                    <div className="text-xs text-red-600">
                      {res.verificationStatus}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center">{res.ownerName}</div>
                    <div className="text-xs text-slate-500">
                      {res.owner?.phone}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {res.fssai || "—"}
                  </td>

                  <td className="px-5 py-4 text-center">
                    {res.gst || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {new Date(res.updatedAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setSelectedRestaurant(res)}
                      className="p-2 hover:bg-slate-200 rounded"
                    >
                      <User size={18} />
                    </button>
                    {console.log(res.owner._id)}
                    <Link
                      to={`/wallet/${res.owner._id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                      title="View Wallet"
                    >
                      <WalletMinimal size={18} />
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      {isSuperAdmin ? (
                        <button
                          disabled={actionLoading === res._id}
                          onClick={() => handleReApprove(res._id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded disabled:opacity-50"
                        >
                          {actionLoading === res._id
                            ? "Approving..."
                            : "Re-Approve"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No Permission
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 relative">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              ❌ Rejected Restaurant Details
            </h2>

            <div className="space-y-3 text-sm">
              <p><b>Name:</b> {selectedRestaurant.name}</p>
              <p><b>Status:</b> {selectedRestaurant.verificationStatus}</p>
              <p><b>Owner:</b> {selectedRestaurant.ownerName}</p>
              <p><b>Phone:</b> {selectedRestaurant.owner?.phone}</p>
              <p><b>FSSAI:</b> {selectedRestaurant.fssai || "N/A"}</p>
              <p><b>GST:</b> {selectedRestaurant.gst || "N/A"}</p>

              {selectedRestaurant.addresses?.[0] && (
                <p className="flex gap-1 items-center">
                  <MapPin size={16} />
                  {selectedRestaurant.addresses[0].line1},{" "}
                  {selectedRestaurant.addresses[0].city}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2 bg-slate-100 rounded"
              >
                Close
              </button>

              {isSuperAdmin && (
                <button
                  disabled={actionLoading === selectedRestaurant._id}
                  onClick={() => handleReApprove(selectedRestaurant._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {actionLoading === selectedRestaurant._id
                    ? "Approving..."
                    : "Re-Approve"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantRejectes;

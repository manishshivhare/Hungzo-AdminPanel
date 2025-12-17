import React, { useEffect, useState } from "react";
import { restaurantList } from "../../Api/index";
import {  approveRestaurantReq, rejectRestaurantReq,} from "../../Api/index";
import {
  User,
  X,
  CheckCircle,
  XCircle,
  Phone,
  FileText,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

const RestaurantVerifi = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ================= FETCH =================
  const fetchRestaurant = async () => {
    try {
      const res = await restaurantList();
      if (res?.ok !== false) {
        setRestaurants(res.data || res);
      }
    } catch (err) {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  // ================= APPROVE =================
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await approveRestaurantReq(id);

      if (res?.ok === false) {
        toast.error(res.message);
        return;
      }

      toast.success("Restaurant approved successfully ✅");
      setSelectedRestaurant(null);
      fetchRestaurant();
    } catch {
      toast.error("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= REJECT =================
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const res = await rejectRestaurantReq(id);

      if (res?.ok === false) {
        toast.error(res.message);
        return;
      }

      toast.success("Restaurant rejected ❌");
      setSelectedRestaurant(null);
      fetchRestaurant();
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-500 text-sm">
        Loading restaurants…
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
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-center">View</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  No pending restaurant verifications
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
                    <div className="text-xs text-slate-500">
                      {res.verificationStatus}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div>{res.owner?.name}</div>
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
                    {new Date(res.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setSelectedRestaurant(res)}
                      className="p-2 hover:bg-slate-200 rounded"
                    >
                      <User size={18} />
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        disabled={actionLoading === res._id}
                        onClick={() => handleApprove(res._id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded disabled:opacity-50"
                      >
                        {actionLoading === res._id
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        disabled={actionLoading === res._id}
                        onClick={() => handleReject(res._id)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded disabled:opacity-50"
                      >
                        {actionLoading === res._id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
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
              🍽 Restaurant Details
            </h2>

            <div className="space-y-3 text-sm">
              <p><b>Name:</b> {selectedRestaurant.name}</p>
              <p><b>Owner:</b> {selectedRestaurant.owner?.name}</p>
              <p><b>Phone:</b> {selectedRestaurant.owner?.phone}</p>
              <p><b>FSSAI:</b> {selectedRestaurant.fssai || "N/A"}</p>
              <p><b>GST:</b> {selectedRestaurant.gst || "N/A"}</p>
              <p className="flex gap-1">
                <MapPin size={16} />
                {selectedRestaurant.addresses?.[0]?.line1}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleReject(selectedRestaurant._id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => handleApprove(selectedRestaurant._id)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantVerifi;

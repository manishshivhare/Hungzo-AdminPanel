import React, { useEffect, useState } from "react";
import { restaurantApproved } from "../../Api";
import {
  User,
  X,
  CheckCircle,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

const RestaurantApproved = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // ================= FETCH =================
  const fetchApprovedRestaurants = async () => {
    try {
      const res = await restaurantApproved();
      if (res?.ok !== false) {
        setRestaurants(res.data || res);
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
          {/* HEADER */}
          <thead className="bg-slate-100 border-b sticky top-0 z-10">
            <tr className="text-xs uppercase tracking-wide text-slate-600">
              <th className="px-6 py-4 text-left">Owner</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Approved On</th>
              <th className="px-6 py-4 text-center">View</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y">
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-16 text-center text-slate-400">
                  No approved restaurants
                </td>
              </tr>
            ) : (
              restaurants.map((res, index) => (
                <tr
                  key={res._id}
                  className={`transition ${index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-slate-100`}
                >
                  {/* OWNER */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {res.name}
                    </p>

                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full
                ${res.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      {res.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </td>

                  {/* PHONE */}
                  <td className="px-6 py-4 text-slate-600">
                    {res.phone || "—"}
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(res.updatedAt).toLocaleDateString()}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedRestaurant(res)}
                      className="inline-flex items-center justify-center w-9 h-9
                           rounded-full bg-slate-200 hover:bg-slate-300
                           transition focus:outline-none focus:ring-2
                           focus:ring-slate-400"
                    >
                      <User size={16} />
                    </button>
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
              className="absolute top-4 right-4 text-slate-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              ✅ Approved Restaurant Details
            </h2>

            <div className="space-y-3 text-sm">
              {/* BASIC INFO */}
              <p>
                <b>Restaurant ID:</b>{" "}
                {selectedRestaurant.restaurantId || "—"}
              </p>
              <p>
                <b>Restaurant Name:</b>{" "}
                {selectedRestaurant.name || "—"}
              </p>

              <p>
                <b>Status:</b>{" "}
                {selectedRestaurant.verificationStatus || "APPROVED"}
              </p>

              {/* OWNER INFO */}
              <p>
                <b>Owner Name:</b>{" "}
                {selectedRestaurant.owner?.name ||
                  selectedRestaurant.name ||
                  "—"}
              </p>

              <p>
                <b>Owner Phone:</b>{" "}
                {selectedRestaurant.owner?.phone ||
                  selectedRestaurant.phone ||
                  "—"}
              </p>

              {/* BUSINESS INFO */}
              <p>
                <b>Accept Date:</b>{" "}
                {selectedRestaurant.updatedAt
                  ? new Date(selectedRestaurant.updatedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                  : "N/A"}
              </p>
              <p>
                <b>FSSAI:</b>{" "}
                {selectedRestaurant.fssai || "N/A"}
              </p>

              <p>
                <b>GST:</b>{" "}
                {selectedRestaurant.gst || "N/A"}
              </p>

              {/* ADDRESS */}
              {selectedRestaurant.address?.length > 0 && (
                <p className="flex gap-1 items-start">
                  <MapPin size={16} className="mt-0.5" />
                  <span>
                    {selectedRestaurant.address[0].line1},{" "}
                    {selectedRestaurant.address[0].city},{" "}
                    {selectedRestaurant.address[0].state}{" "}
                    {selectedRestaurant.address[0].pincode}
                  </span>
                </p>
              )}
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

import React, { useEffect, useState } from "react";
import { restaurantList } from "../../Api";
import { User, X, CheckCircle, XCircle, Phone,  FileText, MapPin } from "lucide-react";

const RestaurantVerifi = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const fetchRestaurant = async () => {
        try {
            const res = await restaurantList();
            if (res?.ok !== false) {
                setRestaurants(res.data || res);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurant();
    }, []);

    if (loading) {
        return (
            <div className="p-6 text-slate-500 text-sm">Loading restaurants…</div>
        );
    }
    const handleApprove = (id) => {
        console.log("Approved:", id);
    };

    const handleReject = (id) => {
        console.log("Rejected:", id);
    };

    return (
        <>
            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border h-[83vh] overflow-y-auto">
                <table className="w-full text-sm h-[50vh] overflow-y-auto">
                    <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr className="text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-5 py-4 text-left">Restaurant</th>
                            <th className="px-5 py-4 text-left">Owner</th>
                            <th className="px-5 py-4">FSSAI</th>
                            <th className="px-5 py-4">GST</th>
                            <th className="px-5 py-4">Created</th>
                            <th className="px-5 py-4 text-center">View</th>
                            <th className="px-5 py-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="">
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
                                    className="border-b hover:bg-slate-50 transition"
                                >
                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        {res.name}
                                        <div className="text-xs text-slate-500 mt-1">
                                            {res.verificationStatus}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-medium text-slate-700">
                                            {res.owner?.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {res.owner?.phone}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-center text-slate-600">
                                        {res.fssai || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-center text-slate-600">
                                        {res.gst || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-500">
                                        {new Date(res.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedRestaurant(res)}
                                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-200 text-slate-600"
                                            title="View Details"
                                        >
                                            <User size={18} />
                                        </button>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700">
                                                Approve
                                            </button>
                                            <button className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700">
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {selectedRestaurant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedRestaurant(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <X size={22} />
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                            🍽 Restaurant Details
                        </h2>

                        {/* Content */}
                        <div className="space-y-3 text-sm text-gray-700">

                            {/* Basic Info */}
                            <p className="flex items-center gap-2">
                                <FileText size={16} />
                                <b>Name:</b> {selectedRestaurant.name}
                            </p>

                            <p>
                                <b>Status:</b>
                                <span
                                    className={`ml-2 px-2 py-1 rounded text-xs font-medium
          ${selectedRestaurant.verificationStatus === "approved"
                                            ? "bg-green-100 text-green-700"
                                            : selectedRestaurant.verificationStatus === "rejected"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {selectedRestaurant.verificationStatus}
                                </span>
                            </p>

                            <p>
                                <b>Created:</b>{" "}
                                {new Date(selectedRestaurant.createdAt).toLocaleString()}
                            </p>

                            <hr />

                            {/* Owner */}
                            <p className="font-semibold">👤 Owner Details</p>
                            <p className="flex items-center gap-2">
                                <User size={16} /> {selectedRestaurant.owner?.name}
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone size={16} /> {selectedRestaurant.owner?.phone}
                            </p>

                            <hr />

                            {/* Documents */}
                            <p className="font-semibold">📄 Documents</p>
                            <p><b>FSSAI:</b> {selectedRestaurant.fssai || "N/A"}</p>
                            <p><b>GST:</b> {selectedRestaurant.gst || "N/A"}</p>

                            <hr />

                            {/* Address */}
                            <p className="font-semibold flex items-center gap-2">
                                <MapPin size={16} /> Address
                            </p>
                            <p>
                                {selectedRestaurant.addresses?.[0]?.line1},{" "}
                                {selectedRestaurant.addresses?.[0]?.city},{" "}
                                {selectedRestaurant.addresses?.[0]?.state} -{" "}
                                {selectedRestaurant.addresses?.[0]?.pincode}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => handleReject(selectedRestaurant._id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                <XCircle size={18} /> Reject
                            </button>

                            <button
                                onClick={() => handleApprove(selectedRestaurant._id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckCircle size={18} /> Approve
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </>
    );
};

export default RestaurantVerifi;

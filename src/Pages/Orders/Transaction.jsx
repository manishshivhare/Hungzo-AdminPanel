import React, { useMemo, useState } from "react";
import {
    CheckCircle,
    Clock,
    XCircle,
    IndianRupee,
    Search,
    Eye,
} from "lucide-react";

/* ================= DATA ================= */
const DATA = [
    { id: "TXN1001", orderId: "ORD5001", user: "Rahul Kumar", amount: 500, status: "Success" },
    { id: "TXN1002", orderId: "ORD5002", user: "Anjali Singh", amount: 320, status: "Pending" },
    { id: "TXN1003", orderId: "ORD5003", user: "Amit Verma", amount: 780, status: "Failed" },
    { id: "TXN1004", orderId: "ORD5004", user: "Priya Sharma", amount: 1200, status: "Success" },
];

const COMMISSION = 0.1;

/* ================= STATUS CONFIG ================= */
const STATUS_CONFIG = {
    Success: {
        color: "text-green-600 bg-green-100",
        row: "hover:bg-green-50",
        icon: CheckCircle,
    },
    Pending: {
        color: "text-yellow-600 bg-yellow-100",
        row: "hover:bg-yellow-50",
        icon: Clock,
    },
    Failed: {
        color: "text-red-600 bg-red-100",
        row: "hover:bg-red-50",
        icon: XCircle,
    },
};

/* ================= BADGE ================= */
const Badge = ({ status }) => {
    const Icon = STATUS_CONFIG[status].icon;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${STATUS_CONFIG[status].color}`}
        >
            <Icon size={14} />
            {status}
        </span>
    );
};

/* ================= MODAL ================= */
const Modal = ({ data, onClose }) => {
    if (!data) return null;
    const adminFee = Math.round(data.amount * COMMISSION);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-xl w-full max-w-sm shadow-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Eye size={18} /> Transaction Details
                </h3>

                <div className="space-y-2 text-sm">
                    <p><b>TXN:</b> {data.id}</p>
                    <p><b>Order:</b> {data.orderId}</p>
                    <p><b>User:</b> {data.user}</p>
                    <p><b>Amount:</b> ₹{data.amount}</p>
                    <p><b>Admin Fee:</b> ₹{adminFee}</p>
                    <p className="font-medium">
                        <b>Settlement:</b> ₹{data.amount - adminFee}
                    </p>
                    <Badge status={data.status} />
                </div>

                <button
                    onClick={onClose}
                    className="mt-5 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

/* ================= STAT CARD ================= */
const StatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white border rounded-lg p-3 flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
            <Icon size={18} className="text-gray-700" />
        </div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);

/* ================= MAIN ================= */
const Transaction = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [selected, setSelected] = useState(null);

    const stats = useMemo(() => ({
        total: DATA.reduce((s, t) => s + t.amount, 0),
        success: DATA.filter(t => t.status === "Success").length,
        pending: DATA.filter(t => t.status === "Pending").length,
    }), []);

    const filtered = DATA.filter(t => {
        const q = search.toLowerCase();
        return (
            (t.id.toLowerCase().includes(q) ||
                t.user.toLowerCase().includes(q)) &&
            (status === "All" || t.status === status)
        );
    });

    return (
        <div className="p-4 bg-gray-50 min-h-screen space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <IndianRupee size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-semibold text-blue-700">₹200</p>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Success</p>
                        <p className="font-semibold text-green-700">12</p>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="font-semibold text-yellow-700">3</p>
                    </div>
                </div>

            </div>


            {/* FILTER */}
            <div className="bg-white p-3 rounded-lg border flex gap-2 items-center">
                <Search size={16} className="text-gray-400" />
                <input
                    className="flex-1 outline-none text-sm"
                    placeholder="Search by TXN or User..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="border px-2 py-1 rounded text-sm"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                >
                    <option>All</option>
                    <option>Success</option>
                    <option>Pending</option>
                    <option>Failed</option>
                </select>
                
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-[63vh]">

                {/* TABLE HEADER */}
                <div className="overflow-y-auto h-full">
                    <table className="w-full text-sm border-separate border-spacing-y-1">

                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="text-gray-500 text-xs uppercase tracking-wide">
                                <th className="px-4 py-3 text-left">Transaction</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-gray-400">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr
                                        key={t.id}
                                        onClick={() => setSelected(t)}
                                        className={`group cursor-pointer bg-white transition 
              hover:shadow-sm ${STATUS_CONFIG[t.status].row}`}
                                    >
                                        {/* LEFT STATUS BAR */}
                                        <td className="px-4 py-3 font-medium flex items-center gap-3">
                                            <span
                                                className={`w-1.5 h-8 rounded-full 
                  ${t.status === "Success"
                                                        ? "bg-green-500"
                                                        : t.status === "Pending"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                    }`}
                                            />
                                            {t.id}
                                        </td>

                                        {/* USER */}
                                        <td className="px-4 py-3 text-gray-700">
                                            {t.user}
                                        </td>

                                        {/* AMOUNT */}
                                        <td
                                            className={`px-4 py-3 text-right font-semibold ${t.amount > 700 ? "text-green-600" : "text-gray-800"
                                                }`}
                                        >
                                            ₹{t.amount}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-3 text-center">
                                            <Badge status={t.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>


            <Modal data={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default Transaction;

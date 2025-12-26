import React, { useState } from "react";
import {
  IndianRupee,
  Wallet,
  Clock,
  Percent,
  Eye,
  User,
  Phone,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ======================================================
   DUMMY DATA
====================================================== */
const drivers = [
  {
    id: 1,
    name: "Rahul Kumar",
    phone: "98xxxxxx12",
    orders: 145,
    earnings: 18450,
    paid: 15000,
    pending: 3450,
  },
  {
    id: 2,
    name: "Amit Singh",
    phone: "97xxxxxx88",
    orders: 98,
    earnings: 12300,
    paid: 12300,
    pending: 0,
  },
  {
    id: 3,
    name: "Rohit Verma",
    phone: "99xxxxxx55",
    orders: 120,
    earnings: 16000,
    paid: 12000,
    pending: 4000,
  },
];

/* ======================================================
   MAIN COMPONENT
====================================================== */
const DriverEarnings = () => {
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 min-h-screen p-2">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Driver Earnings</h1>
        <input
          type="text"
          placeholder="Search driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Total Earnings" value="₹2,45,800" icon={<IndianRupee size={14} />} color="green" />
        <KpiCard title="Commission" value="₹48,200" icon={<Percent size={14} />} color="red" />
        <KpiCard title="Paid" value="₹1,80,000" icon={<Wallet size={14} />} color="blue" />
        <KpiCard title="Pending" value="₹65,800" icon={<Clock size={14} />} color="yellow" />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-lg h-[54vh] overflow-y-auto overflow-x-hidden">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3 text-center">Earnings</th>
              <th className="px-4 py-3 text-center">Paid</th>
              <th className="px-4 py-3 text-center">Pending</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.map((d) => (
              <motion.tr
                key={d.id}
                whileHover={{ scale: 1.01 }}
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-center">{d.orders}</td>

                <td className="px-4 py-3 text-center font-semibold text-green-600">
                  ₹{d.earnings}
                </td>

                <td className="px-4 py-3 text-center text-blue-600">
                  ₹{d.paid}
                </td>

                <td className="px-4 py-3 text-center">
                  {d.pending > 0 ? (
                    <span className="text-yellow-600 font-semibold">
                      ₹{d.pending}
                    </span>
                  ) : (
                    <span className="text-green-600">₹0</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedDriver(d)}
                    className="px-2 py-1 text-xs rounded-full bg-slate-100 hover:bg-slate-200"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DRIVER DETAILS MODAL ================= */}
      <AnimatePresence>
        {selectedDriver && (
          <Modal onClose={() => setSelectedDriver(null)}>

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                <User size={18} className="text-green-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {selectedDriver.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Driver Details
                </p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="space-y-3 text-sm">
              <DetailRow icon={<Phone size={14} />} label="Phone" value={selectedDriver.phone} />
              <DetailRow icon={<Package size={14} />} label="Orders" value={selectedDriver.orders} />
              <DetailRow icon={<IndianRupee size={14} />} label="Total Earnings" value={`₹${selectedDriver.earnings}`} valueClass="text-green-600 font-semibold" />
              <DetailRow icon={<Wallet size={14} />} label="Paid Amount" value={`₹${selectedDriver.paid}`} valueClass="text-blue-600" />
              <DetailRow icon={<Clock size={14} />} label="Pending Amount" value={`₹${selectedDriver.pending}`} valueClass="text-yellow-600" />
            </div>

            {/* FOOTER */}
            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverEarnings;

const Modal = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/85 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-lg p-5 w-full max-w-sm"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

const DetailRow = ({ icon, label, value, valueClass = "" }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2 text-slate-600">
      <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </div>
    <span className={`text-slate-800 ${valueClass}`}>{value}</span>
  </div>
);

const KpiCard = ({ title, value, icon, color }) => {
  const colors = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border rounded-lg p-3 flex justify-between"
    >
      <div>
        <p className="text-[11px] text-slate-500">{title}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
    </motion.div>
  );
};

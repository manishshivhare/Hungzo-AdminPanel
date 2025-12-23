import React, { useEffect, useState } from "react";
import { DriversList, approveDriverReq, rejectDriverReq } from "../../Api";
import {
  User,
  CheckCircle,
  XCircle,
  Search,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";

const DriversVerifi = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  /* ================= FETCH ================= */
  const fetchDrivers = async () => {
    try {
      const res = await DriversList();
      setDrivers(res || []);
    } catch {
      toast.error("Failed to load pending drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  /* ================= ACTIONS ================= */
  const approve = async (id) => {
    try {
      await approveDriverReq(id);
      toast.success("Driver approved");
      fetchDrivers();
    } catch {
      toast.error("Approval failed");
    }
  };

  const reject = async (id) => {
    try {
      await rejectDriverReq(id);
      toast.success("Driver rejected");
      fetchDrivers();
    } catch {
      toast.error("Rejection failed");
    }
  };

  /* ================= SEARCH ================= */
  const filteredDrivers = drivers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.user?.name?.toLowerCase().includes(q) ||
      d.user?.phone?.includes(q) ||
      d.vehicleNumber?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Pending Drivers
          </h2>
          <p className="text-sm text-slate-500">
            {drivers.length} driver(s) awaiting verification
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs uppercase text-slate-500">
              <th className="px-5 py-4 text-left">Driver</th>
              <th className="px-5 py-4 text-left">Phone</th>
              <th className="px-5 py-4 text-left">Vehicle</th>
              <th className="px-5 py-4 text-left">License</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  No pending drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((d) => (
                <tr
                  key={d._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {d.user?.name || "Unnamed Driver"}
                  </td>

                  <td className="px-5 py-4">
                    {d.user?.phone || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {d.vehicleType}
                    <div className="text-xs text-slate-500">
                      {d.vehicleNumber}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {d.licenseNumber || "—"}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                      PENDING
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {isSuperAdmin ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => approve(d._id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded"
                        >
                          <CheckCircle size={14} className="inline mr-1" />
                          Approve
                        </button>

                        <button
                          onClick={() => reject(d._id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs rounded"
                        >
                          <XCircle size={14} className="inline mr-1" />
                          Reject
                        </button>

                        <button
                          onClick={() => setSelectedDriver(d)}
                          className="px-3 py-1.5 border text-xs rounded"
                        >
                          <FileText size={14} className="inline mr-1" />
                          Docs
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No permission
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL ===== */}
      {selectedDriver && (
        <DocumentModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={approve}
        />
      )}
    </div>
  );
};

export default DriversVerifi;

/* ================= MODAL ================= */

const DocumentModal = ({ driver, onClose, onApprove }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-full max-w-md p-6">
      <h3 className="text-lg font-semibold mb-4">Driver Documents</h3>

      <div className="space-y-2 text-sm">
        <p><b>Name:</b> {driver.user?.name}</p>
        <p><b>Phone:</b> {driver.user?.phone}</p>
        <p><b>Vehicle:</b> {driver.vehicleType}</p>
        <p><b>Vehicle No:</b> {driver.vehicleNumber}</p>
        <p><b>License:</b> {driver.licenseNumber}</p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Close
        </button>
        <button
          onClick={() => {
            onApprove(driver._id);
            onClose();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
);

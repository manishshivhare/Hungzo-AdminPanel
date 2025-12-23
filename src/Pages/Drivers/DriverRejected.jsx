import React, { useEffect, useState } from "react";
import { DriverRejected as getRejectedDrivers } from "../../Api";
import {
  User,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const DriverRejected = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchDrivers = async (showToast = false) => {
    try {
      const res = await getRejectedDrivers();
      setDrivers(res || []);
      if (showToast) toast.success("Data refreshed");
    } catch {
      toast.error("Failed to load rejected drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

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
        <div className="h-10 w-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Rejected Drivers
          </h2>
          <p className="text-sm text-slate-500">
            Drivers whose verification was rejected
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Rejected</p>
            <p className="text-2xl font-semibold text-red-600">
              {drivers.length}
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchDrivers(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* ===== Search ===== */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rejected drivers..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* ===== Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.length === 0 ? (
          <EmptyState
            hasSearch={!!search}
            onClear={() => setSearch("")}
          />
        ) : (
          filteredDrivers.map((d) => (
            <div
              key={d._id}
              className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-red-50">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {d.user?.name || "Unnamed Driver"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {d.user?.phone || "—"}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  REJECTED
                </span>
              </div>

              <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Vehicle</p>
                  <p>{d.vehicleType || "—"}</p>
                  <p className="text-xs text-slate-500">
                    {d.vehicleNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">License</p>
                  <p>{d.licenseNumber || "—"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                Verification rejected
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverRejected;

/* ================= SMALL COMPONENTS ================= */

const EmptyState = ({ hasSearch, onClear }) => (
  <div className="col-span-full bg-white border rounded-xl p-8 text-center">
    <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
    <p className="font-medium text-slate-700">
      No rejected drivers
    </p>
    <p className="text-sm text-slate-500 mt-1">
      {hasSearch
        ? "No drivers match your search"
        : "There are no rejected driver records"}
    </p>
    {hasSearch && (
      <button
        onClick={onClear}
        className="mt-3 text-red-600 text-sm"
      >
        Clear search
      </button>
    )}
  </div>
);

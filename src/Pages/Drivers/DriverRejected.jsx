import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DriverRejected as getRejectedDrivers, approveDriverReq } from "../../Api";
import {
  User,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

// Debounce hook for search performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const DriverRejected = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // For approve button loading
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "user.name", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(search, 300); // Debounce search input

  /* ================= FETCH ================= */
  const fetchDrivers = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const res = await getRejectedDrivers();
      setDrivers(res || []);
      if (showToast) toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to load rejected drivers. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  /* ================= SEARCH & FILTER ================= */
  const filteredDrivers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return drivers.filter((d) =>
      d.user?.name?.toLowerCase().includes(q) ||
      d.user?.phone?.includes(q) ||
      d.vehicleNumber?.toLowerCase().includes(q)
    );
  }, [drivers, debouncedSearch]);

  /* ================= SORTING ================= */
  const sortedDrivers = useMemo(() => {
    const sorted = [...filteredDrivers].sort((a, b) => {
      const aValue = sortConfig.key.split(".").reduce((obj, key) => obj?.[key], a) || "";
      const bValue = sortConfig.key.split(".").reduce((obj, key) => obj?.[key], b) || "";
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredDrivers, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* ================= PAGINATION ================= */
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedDrivers.slice(start, start + itemsPerPage);
  }, [sortedDrivers, currentPage]);

  const totalPages = Math.ceil(sortedDrivers.length / itemsPerPage);

  /* ================= APPROVE DRIVER ================= */
  const handleApprove = useCallback(async (id) => {
    const confirm = window.confirm("Are you sure you want to approve this driver?");
    if (!confirm) return;

    setActionLoading(id);
    try {
      const res = await approveDriverReq(id);
      if (res.ok !== false) {
        toast.success("Driver approved successfully");
        setDrivers((prev) => prev.filter((d) => d._id !== id)); // Remove from list
      } else {
        toast.error(res.message || "Failed to approve driver");
      }
    } catch (error) {
      toast.error("An error occurred while approving. Please try again.");
      console.error("Approve error:", error);
    } finally {
      setActionLoading(null);
    }
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-2 bg-gray-50 h-[80vh]">
      {/* ===== Header ===== */}
      <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rejected Drivers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage drivers whose verification was rejected
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or vehicle..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              aria-label="Search rejected drivers"
              type="text"
            />
          </div>

          {/* Count & Refresh */}
          <div className="flex items-center gap-1">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Rejected</p>
              <p className="text-2xl font-bold text-red-600">{drivers.length}</p>
            </div>
         
          </div>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm" role="table" aria-label="Rejected drivers table">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="px-6 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("user.name")}
                aria-sort={sortConfig.key === "user.name" ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}
              >
                Driver {sortConfig.key === "user.name" && (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Vehicle</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">License</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDrivers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <EmptyState hasSearch={!!debouncedSearch} onClear={() => setSearch("")} />
                </td>
              </tr>
            ) : (
              paginatedDrivers.map((d) => (
                <tr key={d._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-red-50">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{d.user?.name || "Unnamed Driver"}</p>
                        <p className="text-sm text-gray-500">{d.user?.phone || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{d.vehicleType || "—"}</p>
                    <p className="text-sm text-gray-500">{d.vehicleNumber || "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{d.licenseNumber || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      <AlertTriangle size={12} />
                      Rejected
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleApprove(d._id)}
                      disabled={actionLoading === d._id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Approve driver ${d.user?.name || "Unnamed"}`}
                    >
                      {actionLoading === d._id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverRejected;

/* ================= SMALL COMPONENTS ================= */

const SkeletonLoader = () => (
  <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
    <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ hasSearch, onClear }) => (
  <div className="text-center py-8">
    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Drivers</h3>
    <p className="text-gray-500">
      {hasSearch
        ? "No drivers match your search criteria."
        : "There are currently no rejected driver records."}
    </p>
    {hasSearch && (
      <button
        onClick={onClear}
        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        Clear Search
      </button>
    )}
  </div>
);
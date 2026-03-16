import React, { useEffect, useState } from "react";
import { DriversList, approveDriverReq, rejectDriverReq } from "../../Api";
import {
  User,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  Truck,
  IdCard,
  X,
  Eye,
  Download,
  Shield,
  Clock,
  DollarSign,
  Navigation,
  Activity
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
  const [viewMode, setViewMode] = useState("table"); // table, grid
  const [filterStatus, setFilterStatus] = useState("ALL");

  /* ================= FETCH ================= */
  const fetchDrivers = async () => {
    try {
      const res = await DriversList();
      // Ensure we have an array and handle nested data
      const driversData = Array.isArray(res) ? res : [];
      console.log("Fetched drivers:", driversData); // For debugging
      setDrivers(driversData);
    } catch (error) {
      console.error("Fetch error:", error);
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
      toast.success("Driver approved successfully");
      fetchDrivers();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Approval failed");
    }
  };

  const reject = async (id) => {
    try {
      await rejectDriverReq(id);
      toast.success("Driver rejected");
      fetchDrivers();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Rejection failed");
    }
  };

  /* ================= FILTERS ================= */
  const filteredDrivers = drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      d.user?.name?.toLowerCase().includes(q) ||
      d.user?.phone?.includes(q) ||
      d.vehicleNumber?.toLowerCase().includes(q) ||
      d.vehicleType?.toLowerCase().includes(q);
    
    const matchesFilter = filterStatus === "ALL" || d.verificationStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = drivers.filter(d => d.verificationStatus === "PENDING").length;

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
            Driver Management
          </h2>
          <p className="text-sm text-slate-500">
            Total Drivers: {drivers.length} | Pending: {pendingCount} 
          </p>
        </div>

        <div className="flex gap-3">
        
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm ${
                viewMode === "table" 
                  ? "bg-yellow-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm ${
                viewMode === "grid" 
                  ? "bg-yellow-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Grid
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drivers..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* ===== DRIVER DISPLAY ===== */}
      {viewMode === "table" ? (
        <DriverTableView 
          drivers={filteredDrivers}
          isSuperAdmin={isSuperAdmin}
          onApprove={approve}
          onReject={reject}
          onViewDocs={setSelectedDriver}
        />
      ) : (
        <DriverGridView 
          drivers={filteredDrivers}
          isSuperAdmin={isSuperAdmin}
          onApprove={approve}
          onReject={reject}
          onViewDocs={setSelectedDriver}
        />
      )}

      {/* ===== DETAILED DOCUMENT MODAL ===== */}
      {selectedDriver && (
        <DocumentModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={approve}
          onReject={reject}
        />
      )}
    </div>
  );
};

/* ================= TABLE VIEW ================= */
const DriverTableView = ({ drivers, isSuperAdmin, onApprove, onReject, onViewDocs }) => (
  <div className="overflow-x-auto rounded-xl border bg-white">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b">
        <tr className="text-xs uppercase text-slate-500">
          <th className="px-5 py-4 text-left">Driver Details</th>
          <th className="px-5 py-4 text-left">Contact</th>
          <th className="px-5 py-4 text-left">Vehicle Info</th>
          <th className="px-5 py-4 text-left">Documents</th>
          <th className="px-5 py-4 text-left">Status & Location</th>
          <th className="px-5 py-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {drivers.length === 0 ? (
          <tr>
            <td colSpan="6" className="py-10 text-center text-slate-400">
              No drivers found
            </td>
          </tr>
        ) : (
          drivers.map((d) => (
            <tr key={d._id} className="border-b hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {d.profilePic ? (
                    <img 
                      src={d.profilePic} 
                      alt={d.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={20} className="text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{d.user?.name || "Unnamed Driver"}</p>
                    <p className="text-xs text-slate-500">ID: {d._id?.slice(-8)}</p>
                    <p className="text-xs text-slate-500">
                      Joined: {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-1">
                  <p className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    {d.user?.phone || "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.user?.email || "No email"}
                  </p>
                </div>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-1">
                  <p className="font-medium">{d.vehicleType}</p>
                  <p className="text-xs text-slate-500">{d.vehicleNumber}</p>
                  {d.vehicleImage && (
                    <a 
                      href={d.vehicleImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Camera size={12} /> View Vehicle
                    </a>
                  )}
                </div>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-1">
                  {d.licenseImage && (
                    <a 
                      href={d.licenseImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <IdCard size={12} /> License
                    </a>
                  )}
                  {d.aadharImage && (
                    <a 
                      href={d.aadharImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <IdCard size={12} /> Aadhar
                    </a>
                  )}
                </div>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-2">
                  <span className={`px-2 py-1 text-xs rounded inline-block ${
                    d.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    d.verificationStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {d.verificationStatus || "PENDING"}
                  </span>
                  
                  {d.currentLocation && d.currentLocation.lat !== 0 && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} />
                      {d.currentLocation.lat?.toFixed(4)}, {d.currentLocation.lng?.toFixed(4)}
                    </p>
                  )}
                  
                  <div className="flex gap-2 text-xs">
                    <span className={`flex items-center gap-1 ${d.isOnline ? "text-green-600" : "text-slate-400"}`}>
                      <Activity size={10} /> {d.isOnline ? "Online" : "Offline"}
                    </span>
                    <span className={`flex items-center gap-1 ${d.isActive ? "text-green-600" : "text-slate-400"}`}>
                      <Clock size={10} /> {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                {isSuperAdmin ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onApprove(d._id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(d._id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        <XCircle size={14} className="inline mr-1" />
                        Reject
                      </button>
                    </div>
                    <button
                      onClick={() => onViewDocs(d)}
                      className="px-3 py-1.5 border text-xs rounded hover:bg-slate-50 w-full"
                    >
                      <FileText size={14} className="inline mr-1" />
                      View Full Details
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No permission</span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

/* ================= GRID VIEW ================= */
const DriverGridView = ({ drivers, isSuperAdmin, onApprove, onReject, onViewDocs }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {drivers.length === 0 ? (
      <div className="col-span-full py-10 text-center text-slate-400">
        No drivers found
      </div>
    ) : (
      drivers.map((d) => (
        <div key={d._id} className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {d.profilePic ? (
              <img 
                src={d.profilePic} 
                alt={d.user?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={24} className="text-slate-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium">{d.user?.name || "Unnamed Driver"}</h3>
              <p className="text-xs text-slate-500">{d.user?.phone || "No phone"}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              d.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              d.verificationStatus === "APPROVED" ? "bg-green-100 text-green-700" :
              "bg-red-100 text-red-700"
            }`}>
              {d.verificationStatus || "PENDING"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">Vehicle</p>
              <p className="font-medium">{d.vehicleType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Number</p>
              <p className="font-medium">{d.vehicleNumber}</p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <span className={`flex items-center gap-1 ${d.isOnline ? "text-green-600" : "text-slate-400"}`}>
              <Activity size={12} /> {d.isOnline ? "Online" : "Offline"}
            </span>
            <span className={`flex items-center gap-1 ${d.isActive ? "text-green-600" : "text-slate-400"}`}>
              <Clock size={12} /> {d.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {d.totalEarnings > 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <DollarSign size={12} /> Total Earnings: ₹{d.totalEarnings}
            </p>
          )}

          {isSuperAdmin && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onApprove(d._id)}
                className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(d._id)}
                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => onViewDocs(d)}
                className="px-3 py-1.5 border text-xs rounded hover:bg-slate-50"
              >
                <Eye size={14} />
              </button>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

/* ================= DETAILED DOCUMENT MODAL ================= */
const DocumentModal = ({ driver, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Driver Complete Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details" 
                  ? "border-yellow-500 text-yellow-600" 
                  : "border-transparent text-slate-500"
              }`}
            >
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "documents" 
                  ? "border-yellow-500 text-yellow-600" 
                  : "border-transparent text-slate-500"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("vehicle")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "vehicle" 
                  ? "border-yellow-500 text-yellow-600" 
                  : "border-transparent text-slate-500"
              }`}
            >
              Vehicle Details
            </button>
     
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {driver.profilePic ? (
                  <img 
                    src={driver.profilePic} 
                    alt={driver.user?.name}
                    className="w-20 h-20 rounded-full object-cover border-2"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <User size={40} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-semibold">{driver.user?.name || "Unnamed Driver"}</h4>
                  <p className="text-slate-500">Driver ID: {driver._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Phone:</span> {driver.user?.phone || "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Profile Completed:</span> {driver.user?.isProfileCompleted ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium mb-2">Account Created</p>
                  <p className="text-sm">{driver.createdAt ? new Date(driver.createdAt).toLocaleString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Last Updated</p>
                  <p className="text-sm">{driver.updatedAt ? new Date(driver.updatedAt).toLocaleString() : "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              {/* Aadhar Card */}
              {driver.aadharImage && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield size={16} /> Aadhar Card
                  </h4>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={driver.aadharImage} 
                      alt="Aadhar"
                      className="max-h-64 mx-auto object-contain"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <a 
                        href={driver.aadharImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> View Full Size
                      </a>
                      <a 
                        href={driver.aadharImage} 
                        download
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* License */}
              {driver.licenseImage && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <IdCard size={16} /> Driving License
                  </h4>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={driver.licenseImage} 
                      alt="License"
                      className="max-h-64 mx-auto object-contain"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <a 
                        href={driver.licenseImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> View Full Size
                      </a>
                      <a 
                        href={driver.licenseImage} 
                        download
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "vehicle" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Vehicle Type</p>
                  <p className="text-lg">{driver.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vehicle Number</p>
                  <p className="text-lg">{driver.vehicleNumber}</p>
                </div>
              </div>

              {driver.vehicleImage && (
                <div>
                  <p className="text-sm font-medium mb-2">Vehicle Image</p>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={driver.vehicleImage} 
                      alt="Vehicle"
                      className="max-h-64 mx-auto object-contain"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <a 
                        href={driver.vehicleImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> View Full Size
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

         
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onApprove(driver._id);
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle size={16} className="inline mr-1" />
            Approve Driver
          </button>
          <button
            onClick={() => {
              onReject(driver._id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <XCircle size={16} className="inline mr-1" />
            Reject Driver
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriversVerifi;
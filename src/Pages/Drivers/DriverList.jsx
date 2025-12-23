import React, { useEffect, useState } from "react";
import { DriverApproved as getApprovedDrivers } from "../../Api";
import { User, CheckCircle, Search, Filter, Download, Eye, Phone, Car, Shield } from "lucide-react";
import toast from "react-hot-toast";

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedDriver, setSelectedDriver] = useState(null);

  /* ================= FETCH ================= */
  const fetchDrivers = async () => {
    try {
      const res = await getApprovedDrivers();
      setDrivers(res || []);
      setFilteredDrivers(res || []);
    } catch {
      toast.error("Failed to load approved drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredDrivers(drivers);
      return;
    }

    const q = search.toLowerCase();
    setFilteredDrivers(
      drivers.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(q) ||
          d.user?.phone?.includes(q) ||
          d.vehicleNumber?.toLowerCase().includes(q) ||
          d.licenseNumber?.toLowerCase().includes(q)
      )
    );
  }, [search, drivers]);

 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ================= CONTROLS ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4  py-2 rounded-xl border">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, vehicle or license..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} className="text-gray-600" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} className="text-gray-600" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ================= DRIVERS TABLE ================= */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider">Driver Info</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider">Vehicle Details</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider">License</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 h-[48vh] overflow-y-auto">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No drivers found</p>
                      <p className="text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.user?.name || "—"}</p>
                          <p className="text-xs text-gray-500">ID: {driver._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {driver.user?.phone || "—"}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{driver.vehicleType || "—"}</p>
                          <p className="text-sm text-gray-500">{driver.vehicleNumber || "—"}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {driver.licenseNumber || "—"}
                      </code>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* ================= TABLE FOOTER ================= */}
        {filteredDrivers.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-600">
            <p>Showing <span className="font-semibold">{filteredDrivers.length}</span> of <span className="font-semibold">{drivers.length}</span> drivers</p>
            <p className="text-gray-500">Sorted by: Recently Added</p>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedDriver && (
        <DriverModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */

const DriverModal = ({ driver, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div 
      className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="bg-gradient-to from-green-600 to-green-700 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Driver Details</h3>
            <p className="text-green-100 mt-1">Complete driver information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b">Personal Information</h4>
            <DetailItem label="Full Name" value={driver.user?.name} />
            <DetailItem label="Email" value={driver.user?.email} />
            <DetailItem label="Phone" value={driver.user?.phone} />
            <DetailItem label="Driver ID" value={driver._id} />
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b">Vehicle Information</h4>
            <DetailItem label="Vehicle Type" value={driver.vehicleType} />
            <DetailItem label="Vehicle Number" value={driver.vehicleNumber} />
            <DetailItem label="License Number" value={driver.licenseNumber} />
            <DetailItem label="Status" value={
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4" />
                Approved
              </span>
            } />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Online Status</p>
              <p className="font-medium">
                {driver.isOnline ? (
                  <span className="text-green-600">Currently Online</span>
                ) : (
                  <span className="text-gray-600">Offline</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Active Status</p>
              <p className="font-medium">
                {driver.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-gray-600">Inactive</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Registration Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          Close
        </button>
        <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
          Contact Driver
        </button>
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500 mb-1">{label}</span>
    <span className="font-medium text-gray-900">{value || "Not Available"}</span>
  </div>
);

export default DriverList;
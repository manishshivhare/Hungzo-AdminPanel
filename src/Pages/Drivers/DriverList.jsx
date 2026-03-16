import React, { useEffect, useState } from "react";
import { DriverApproved as getApprovedDrivers } from "../../Api";
import { User, CheckCircle, Search, Download, Eye, Phone, Car, Bike, X, MapPin, IdCard, Calendar, Activity, Truck, FileText, Mail, Award, Clock, Navigation, ShieldCheck, Wifi, Maximize2, MoveUpRightIcon, } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    active: 0
  });

  /* ================= FETCH ================= */
  const fetchDrivers = async () => {
    try {
      const res = await getApprovedDrivers();
      setDrivers(res || []);
      setFilteredDrivers(res || []);

      // Calculate stats
      const total = res?.length || 0;
      const online = res?.filter(d => d.isOnline).length || 0;
      const active = res?.filter(d => d.isActive).length || 0;
      setStats({ total, online, active });

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
          d.licenseNumber?.toLowerCase().includes(q) ||
          d.vehicleType?.toLowerCase().includes(q)
      )
    );
  }, [search, drivers]);

  const handleContact = (phoneNumber) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
      toast.success(`Opening WhatsApp chat`);
    } else {
      toast.error("Driver phone number not available");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-green-200 rounded-full"></div>
          <div className="h-16 w-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 ">

      {/* Search and Export Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, vehicle or license..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50"
            />
          </div>

          <button
            onClick={() => {
              // Export functionality
              toast.success("Exporting drivers list...");
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span>Export List</span>
          </button>
        </div>
      </div>

      {/* Drivers Grid/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[70vh] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-3 rounded-full mb-3">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No drivers found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver._id}
                    className="hover:bg-green-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            {driver.profilePic ? (
                              <img
                                src={driver.profilePic}
                                alt={driver.user?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {driver.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.user?.name || "—"}</p>
                          <p className="text-xs text-gray-500">ID: {driver._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{driver.user?.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {driver.vehicleType?.toLowerCase().includes("bike") ? (
                          <Bike className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Car className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{driver.vehicleType || "—"}</p>
                          <p className="text-xs text-gray-500">{driver.vehicleNumber || "—"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDriver(driver);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
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
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onContact={handleContact}
        />
      )}
    </div>
  );
};

/* ================= MODAL COMPONENT ================= */
const DriverDetailsModal = ({ driver, onClose, onContact }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {/* Header - Modern Glass Design */}
          <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Left side with icon and title */}
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Driver Profile</h2>
                    <p className="text-green-100 text-sm mt-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-300 rounded-full"></span>
                      Complete information and details
                    </p>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3">
                  {/* Driver ID Card */}
                  <div className="bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/20 shadow-lg">
                    <p className="text-xs text-green-200 font-medium">DRIVER ID</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white tracking-wider">
                        {driver._id?.slice(0, 4)}...{driver._id?.slice(-4)}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(driver._id);
                          toast.success('ID copied to clipboard');
                        }}
                        className="text-green-200 hover:text-white transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Orders Button */}
                  <Link
                    to={`/driver-orders/${driver._id}`}
                    state={{
                      driverName: driver.user?.name,
                      driverPhone: driver.user?.phone
                    }}
                    className="group flex items-center gap-3 bg-white hover:bg-green-50 px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="text-sm font-semibold text-green-700">VIEW ORDERS</span>
                    <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors">
                      <MoveUpRightIcon className="w-4 h-4 text-green-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Close Button with animation */}
                  <button
                    onClick={onClose}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-lg transition-all duration-300 hover:rotate-90 hover:shadow-xl"
                    title="Close"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>


            </div>
          </div>
          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  {driver.profilePic ? (
                    <img
                      src={driver.profilePic}
                      alt={driver.user?.name}
                      className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(driver.profilePic)}
                    />
                  ) : (
                    <User className="w-12 h-12 text-green-600" />
                  )}
                </div>
                {driver.isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-3 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{driver.user?.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    Approved Driver
                  </span>
                  {driver.isActive && (
                    <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      <Activity className="w-4 h-4" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Personal Information
                </h4>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <InfoItem
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                    label="Phone Number"
                    value={driver.user?.phone}
                  />

                  <InfoItem
                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
                    label="Joined Date"
                    value={new Date(driver.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Vehicle Information
                </h4>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <InfoItem
                    icon={driver.vehicleType?.toLowerCase().includes("bike") ?
                      <Bike className="w-4 h-4 text-gray-400" /> :
                      <Car className="w-4 h-4 text-gray-400" />
                    }
                    label="Vehicle Type"
                    value={driver.vehicleType}
                  />
                  <InfoItem
                    icon={<Award className="w-4 h-4 text-gray-400" />}
                    label="Vehicle Number"
                    value={driver.vehicleNumber}
                  />

                </div>
              </div>

              {/* Current Location */}
              {driver.currentLocation && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Current Location
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        icon={<Navigation className="w-4 h-4 text-gray-400" />}
                        label="Latitude"
                        value={driver.currentLocation.lat}
                      />
                      <InfoItem
                        icon={<Navigation className="w-4 h-4 text-gray-400" />}
                        label="Longitude"
                        value={driver.currentLocation.lng}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Overview */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Status Overview
                </h4>
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <StatusCard
                      icon={<Wifi className="w-5 h-5" />}
                      label="Online Status"
                      value={driver.isOnline ? "Online" : "Offline"}
                      color={driver.isOnline ? "green" : "gray"}
                    />
                    <StatusCard
                      icon={<Activity className="w-5 h-5" />}
                      label="Active Status"
                      value={driver.isActive ? "Active" : "Inactive"}
                      color={driver.isActive ? "blue" : "gray"}
                    />
                    <StatusCard
                      icon={<ShieldCheck className="w-5 h-5" />}
                      label="Verification"
                      value="Approved"
                      color="green"
                    />
                    <StatusCard
                      icon={<Clock className="w-5 h-5" />}
                      label="Last Updated"
                      value={new Date(driver.updatedAt).toLocaleDateString()}
                      color="gray"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {(driver.aadharImage || driver.licenseImage || driver.vehicleImage) && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {driver.aadharImage && (
                    <DocumentCard
                      title="Aadhar Card"
                      imageUrl={driver.aadharImage}
                      icon={<IdCard className="w-5 h-5" />}
                      onImageClick={() => setSelectedImage(driver.aadharImage)}
                    />
                  )}
                  {driver.licenseImage && (
                    <DocumentCard
                      title="Driving License"
                      imageUrl={driver.licenseImage}
                      icon={<FileText className="w-5 h-5" />}
                      onImageClick={() => setSelectedImage(driver.licenseImage)}
                    />
                  )}
                  {driver.vehicleImage && (
                    <DocumentCard
                      title="Vehicle Image"
                      imageUrl={driver.vehicleImage}
                      icon={<Truck className="w-5 h-5" />}
                      onImageClick={() => setSelectedImage(driver.vehicleImage)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onContact(driver.user?.phone)}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact Driver
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full screen preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => window.open(selectedImage, '_blank')}
              className="absolute bottom-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors z-10 flex items-center gap-2 bg-black/30"
            >
              <Maximize2 className="w-5 h-5" />
              <span>Open Original</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* ================= HELPER COMPONENTS ================= */
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  </div>
);

const StatusCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    gray: "text-gray-600 bg-gray-100"
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold text-${color}-600`}>{value}</p>
    </div>
  );
};

const DocumentCard = ({ title, imageUrl, icon, onImageClick }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div
      className="aspect-video bg-gray-100 relative group cursor-pointer"
      onClick={onImageClick}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Eye className="w-6 h-6 text-white" />
        <span className="text-white text-sm font-medium">Click to view full screen</span>
      </div>
    </div>
    <div className="p-3 flex items-center gap-2">
      <div className="text-gray-400">{icon}</div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
    </div>
  </div>
);

export default DriverList;
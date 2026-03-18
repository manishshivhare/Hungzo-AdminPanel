import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { DriverOrder as fetchDriverOrders } from "../../Api";
import { 
  Truck, 
  Package, 
  Phone, 
  MapPin, 
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  User
} from "lucide-react";
import toast from "react-hot-toast";

const DriverOrder = () => {
  const { driverId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get driver name from location state or use default
  const driverName = location.state?.driverName || "Unknown Driver";
  const driverPhone = location.state?.driverPhone || "";
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalItems: 0
  });

  // Ref for orders container to enable scrolling
  const ordersContainerRef = useRef(null);

  const id = driverId;

  const getOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDriverOrders(id);

      if (res?.success) {
        setOrders(res.orders);
        setFilteredOrders(res.orders);
        calculateStats(res.orders);
      } else {
        setError("Failed to fetch orders");
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error("Error fetching orders:", err);
      toast.error("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, [id]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, dateRange, orders]);

  // Scroll to top when filters change
  useEffect(() => {
    scrollToTop();
  }, [searchTerm, statusFilter, dateRange]);

  const calculateStats = (ordersData) => {
    const total = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completed = ordersData.filter(o => o.driverStatus === "DELIVERED").length;
    const pending = ordersData.filter(o => 
      o.driverStatus === "DRIVER_ACCEPTED" || 
      o.driverStatus === "ASSIGNED" || 
      o.driverStatus === "PICKED_UP"
    ).length;
    const items = ordersData.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    setStats({
      totalOrders: ordersData.length,
      totalAmount: total,
      completedOrders: completed,
      pendingOrders: pending,
      totalItems: items
    });
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone?.includes(searchTerm) ||
        order.userDetails?.phone?.includes(searchTerm) ||
        order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.driverStatus === statusFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(dateRange.start) && orderDate <= new Date(dateRange.end);
      });
    }

    setFilteredOrders(filtered);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'DRIVER_ACCEPTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'ASSIGNED': 'bg-blue-100 text-blue-800 border-blue-200',
      'PICKED_UP': 'bg-purple-100 text-purple-800 border-purple-200',
      'ON_THE_WAY': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const handleRefresh = () => {
    getOrders();
    toast.success("Orders refreshed");
  };


  // Scroll to top function
  const scrollToTop = () => {
    if (ordersContainerRef.current) {
      ordersContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-green-200 rounded-full"></div>
            <div className="h-16 w-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading orders for {driverName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-800 font-medium">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100vh] bg-gray-50 flex flex-col overflow-y-auto ">
      {/* Header - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{driverName}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Driver ID: {driverId?.slice(-8)} {driverPhone && `• ${driverPhone}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
           
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Scrollable Container */}
      <div 
        ref={ordersContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ height: 'calc(100vh - 80px)' }} // Adjust based on header height
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          {/* Orders Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
            </p>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  {/* Order Header - Compact View */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-mono text-gray-500">
                          #{order._id?.slice(-8)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.driverStatus)}`}>
                          {order.driverStatus}
                        </span>
                        <span className="text-sm text-gray-600">
                          {order.user?.phone || order.userDetails?.phone}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{order.totalAmount}
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                        {expandedOrder === order._id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Customer Details</h4>
                          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                            <p><span className="text-gray-500">Name:</span> {order.userDetails?.name || 'N/A'}</p>
                            <p><span className="text-gray-500">Phone:</span> {order.user?.phone || order.userDetails?.phone}</p>
                            <p><span className="text-gray-500">Address:</span> {order.shippingAddress}</p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Order Details</h4>
                          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                            <p><span className="text-gray-500">Payment:</span> {order.paymentMethod}</p>
                            <p><span className="text-gray-500">Order Status:</span> {order.orderStatus}</p>
                            <p><span className="text-gray-500">Items:</span> {order.items?.length || 0}</p>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="col-span-2 mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                          <div className="bg-white rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-gray-600">Product</th>
                                  <th className="px-3 py-2 text-left text-gray-600">Variety</th>
                                  <th className="px-3 py-2 text-right text-gray-600">Price</th>
                                  <th className="px-3 py-2 text-right text-gray-600">Qty</th>
                                  <th className="px-3 py-2 text-right text-gray-600">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {order.items?.map((item) => (
                                  <tr key={item._id}>
                                    <td className="px-3 py-2">{item.productName}</td>
                                    <td className="px-3 py-2 text-gray-500">{item.varietyName}</td>
                                    <td className="px-3 py-2 text-right">₹{item.price}</td>
                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                    <td className="px-3 py-2 text-right font-medium">₹{item.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan="4" className="px-3 py-2 text-right text-gray-600">Subtotal:</td>
                                  <td className="px-3 py-2 text-right font-medium">₹{order.subTotal}</td>
                                </tr>
                                <tr>
                                  <td colSpan="4" className="px-3 py-2 text-right text-gray-600">Delivery:</td>
                                  <td className="px-3 py-2 text-right">₹{order.deliveryCharge || 0}</td>
                                </tr>
                                <tr>
                                  <td colSpan="4" className="px-3 py-2 text-right text-gray-900 font-bold">Total:</td>
                                  <td className="px-3 py-2 text-right font-bold text-green-600">₹{order.totalAmount}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverOrder;
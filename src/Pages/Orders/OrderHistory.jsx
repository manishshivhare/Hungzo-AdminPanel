import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthProvider";
import { getAllOrders, getAdminOrders, restaurantApproved, restaurantRejected, restaurantList } from "../../Api";
import { generateInvoice } from "./generateInvoice";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

/* ================= HELPERS ================= */
const formatDate = (iso) =>
  new Date(iso).toISOString().split("T")[0];

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Refunded":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return "✅";
    case "Cancelled":
      return "❌";
    case "Refunded":
      return "🔄";
    default:
      return "📦";
  }
};

const getPaymentColor = (method) =>
  method === "COD" ? "text-orange-600" : "text-green-600";

const formatFulfillmentType = (type) => {
  if (!type) return "—";
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

/* ================= CSV EXPORT HELPERS ================= */
const convertToCSV = (data) => {
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Order Items",
    "Status",
    "Date",
    "Time",
    "Total Amount (₹)",
    "Payment Method",
    "Fulfillment Type",
    "Sub Total (₹)",
    "GST Amount (₹)",
    "Delivery Charge (₹)",
    "Order Status",
    "Payment Status",
    "Shipping Address",
    "Created At"
  ];

  const rows = data.map(order => [
    order.id,
    order.customerName || "N/A",
    order.email,
    order.phone || "N/A",
    `"${order.items.replace(/"/g, '""')}"`,
    order.status,
    order.date,
    order.time,
    order.total.replace("₹", ""),
    order.payment,
    order.fulfillmentType,
    order.raw.subTotal || 0,
    order.raw.gstAmount || 0,
    order.raw.deliveryCharge || 0,
    order.raw.orderStatus,
    order.raw.paymentStatus || "N/A",
    `"${(order.raw.shippingAddress || "N/A").replace(/"/g, '""')}"`,
    new Date(order.raw.createdAt).toLocaleString()
  ]);

  return [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");
};

const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/* ================= EXCEL EXPORT ================= */
const exportToExcel = (data, filename) => {
  try {
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customerName,
      'Email': order.email,
      'Phone': order.phone,
      'Items': order.items,
      'Status': order.status,
      'Date': order.date,
      'Time': order.time,
      'Amount': order.total.replace('₹', ''),
      'Payment Method': order.payment,
      'Fulfillment Type': order.fulfillmentType,
      'Sub Total': order.raw.subTotal || 0,
      'GST': order.raw.gstAmount || 0,
      'Delivery Charge': order.raw.deliveryCharge || 0
    })));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Generate file
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error("Excel export failed:", error);
    return false;
  }
};

/* ================= FILTER CATEGORIES ================= */
const FILTER_CATEGORIES = [
  { id: 'email', label: ' Email', icon: '📧' },
  { id: 'phone', label: ' Phone', icon: '📱' },
  { id: 'status', label: ' Status', icon: '📋' },
  { id: 'payment', label: ' Payment Method', icon: '💳' },
  { id: 'date', label: ' Date Range', icon: '📅' },
  { id: 'amount', label: ' Amount Range', icon: '💰' },
];

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed', icon: '✅' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌' },
  { value: 'refunded', label: 'Refunded', icon: '🔄' },
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'processing', label: 'Processing', icon: '⚙️' },
];

const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery', icon: '💵' },
  { value: 'ONLINE', label: 'Online Payment', icon: '💳' },
  { value: 'CARD', label: 'Card Payment', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
];

/* ================= MAIN ================= */
const OrderHistory = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Professional filter state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  const [restaurants, setRestaurants] = useState([]);

  // Ref for table container
  const tableContainerRef = useRef(null);

  // Get unique values for filters
  const uniqueEmails = useMemo(() => {
    const emails = orders.map(o => o.email).filter(email => email && email !== "—");
    return [...new Set(emails)];
  }, [orders]);

  const uniquePhones = useMemo(() => {
    const phones = orders.map(o => o.phone).filter(phone => phone && phone !== "—");
    return [...new Set(phones)];
  }, [orders]);

  const uniqueDates = useMemo(() => {
    const dates = orders.map(o => o.date);
    return [...new Set(dates)].sort().reverse();
  }, [orders]);

  // Function to scroll table to top
  const scrollTableToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth' // This adds a smooth scrolling animation
      });
    }
  };

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    if (!user?.role) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Load restaurants for email/phone dropdown
        const restaurantRes = await restaurantApproved();
        const restaurantRej = await restaurantRejected();
        const restaurantPen = await restaurantList();
        const newdata = [
          ...restaurantRes,
          ...restaurantRej,
          ...restaurantPen
        ];
        setRestaurants(newdata);

        // Load orders
        let res;
        if (user.role === "SUPERADMIN") {
          res = await getAllOrders();
        } else if (user.role === "ADMIN") {
          res = await getAdminOrders();
        
         
        } else {
          return;
        }

        if (!res?.ok) throw new Error();

        const mapped = res.data.orders.map((o) => ({
          id: o._id,
          items: o.items
            .map((i) => `${i.productName} (${i.varietyName}) × ${i.quantity}`)
            .join(", "),
          customerName: o.user?.restaurantId?.name || o.user?.name || "—",
          email: o.userDetails?.email || o.user?.email || "—",
          phone: o.userDetails?.phone || o.user?.phone || o.shippingAddress?.phone || "—",
          status:
            o.orderStatus === "Delivered" || o.orderStatus === "Picked by Customer"
              ? "Completed"
              : o.orderStatus,
          date: formatDate(o.createdAt),
          time: formatTime(o.createdAt),
          total: `₹${o.totalAmount}`,
          totalValue: o.totalAmount,
          payment: o.paymentMethod,
          fulfillmentType: formatFulfillmentType(o.fulfillmentType),
          raw: o,
        }));

        setOrders(mapped);
        console.log("Loaded orders:", mapped);
        
      } catch (e) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  /* ================= FILTER LOGIC ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // No category selected - show all
      if (!selectedCategory) return true;

      switch (selectedCategory) {
        case 'email':
          return !filterValue || o.email === filterValue;

        case 'phone':
          return !filterValue || o.phone === filterValue;

        case 'status':
          return !filterValue || o.status.toLowerCase() === filterValue.toLowerCase();

        case 'payment':
          return !filterValue || o.payment === filterValue;

        case 'date':
          if (dateRange.start && dateRange.end) {
            return o.date >= dateRange.start && o.date <= dateRange.end;
          } else if (dateRange.start) {
            return o.date >= dateRange.start;
          } else if (dateRange.end) {
            return o.date <= dateRange.end;
          }
          return true;

        case 'amount':
          if (amountRange.min && amountRange.max) {
            return o.totalValue >= Number(amountRange.min) && o.totalValue <= Number(amountRange.max);
          } else if (amountRange.min) {
            return o.totalValue >= Number(amountRange.min);
          } else if (amountRange.max) {
            return o.totalValue <= Number(amountRange.max);
          }
          return true;

        default:
          return true;
      }
    });
  }, [orders, selectedCategory, filterValue, dateRange, amountRange]);

  // Scroll to top whenever filters change
  useEffect(() => {
    scrollTableToTop();
  }, [selectedCategory, filterValue, dateRange, amountRange]);

  /* ================= GROUP BY DATE ================= */
  const groupedOrders = useMemo(() => {
    return filteredOrders.reduce((acc, o) => {
      acc[o.date] = acc[o.date] || [];
      acc[o.date].push(o);
      return acc;
    }, {});
  }, [filteredOrders]);

  /* ================= ANALYTICS ================= */
  const analytics = useMemo(() => {
    const completed = orders.filter((o) => o.status === "Completed");
    const revenue = completed.reduce((sum, o) => sum + o.totalValue, 0);
    const filteredRevenue = filteredOrders.reduce((sum, o) => sum + o.totalValue, 0);

    return {
      total: orders.length,
      completed: completed.length,
      revenue,
      filteredTotal: filteredOrders.length,
      filteredRevenue,
      rate: orders.length ? ((completed.length / orders.length) * 100).toFixed(1) : 0,
    };
  }, [orders, filteredOrders]);

  /* ================= EXPORT FUNCTION ================= */
  const handleExport = async () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    try {
      setExportLoading(true);

      // Prepare filename
      const date = new Date().toISOString().split('T')[0];
      const filterStatus = selectedCategory ? 'filtered' : 'all';
      const filename = `orders_${filterStatus}_${date}.xlsx`;

      // Export to Excel
      const success = exportToExcel(filteredOrders, filename);

      if (success) {
        toast.success(`Exported ${filteredOrders.length} orders successfully!`);
      } else {
        // Fallback to CSV if Excel fails
        const csvContent = convertToCSV(filteredOrders);
        downloadCSV(csvContent, filename.replace('.xlsx', '.csv'));
        toast.success(`Exported ${filteredOrders.length} orders as CSV`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export orders");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      setInvoiceLoading(true);
      await generateInvoice(order.raw);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setFilterValue('');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
  };

  // Get filter options based on selected category
  const getFilterOptions = () => {
    switch (selectedCategory) {
      case 'email':
        return uniqueEmails.map(email => ({ value: email, label: email }));
      case 'phone':
        return uniquePhones.map(phone => ({ value: phone, label: phone }));
      case 'status':
        return STATUS_OPTIONS;
      case 'payment':
        return PAYMENT_OPTIONS;
      case 'date':
        return uniqueDates.map(date => ({ value: date, label: date }));
      default:
        return [];
    }
  };

  // Render filter input based on category
  const renderFilterInput = () => {
    switch (selectedCategory) {
      case 'date':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'amount':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>
          </div>
        );

      default:
        const options = getFilterOptions();
        return (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.label}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.icon && `${option.icon} `}{option.label}
              </option>
            ))}
          </select>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-1">⏳</div>
          <p className="text-gray-500">Loading order history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1 h-screen overflow-y-auto">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
          <h2 className="text-2xl font-bold">📊 Order History</h2>

          <div className="flex gap-2">
            {selectedCategory && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center gap-2"
              >
                🧹 Clear Filters
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={exportLoading || filteredOrders.length === 0}
              className={`px-4 py-2 rounded flex items-center gap-2 ${filteredOrders.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : exportLoading
                    ? "bg-green-500 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              {exportLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Exporting...
                </>
              ) : (
                <>
                  📊 Export to Excel ({filteredOrders.length}/{orders.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= PROFESSIONAL FILTER SECTION ================= */}
        <div className="bg-gray-50 p-4 rounded-lg mb-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <span>🔍</span> Advanced Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Filter Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FILTER_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setFilterValue('');
                      setDateRange({ start: '', end: '' });
                      setAmountRange({ min: '', max: '' });
                    }}
                    className={`p-2 rounded-lg text-sm flex items-center gap-2 transition-all ${selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <span>{category.icon}</span>
                    <span className="truncate">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Value Input */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 rounded-lg border"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </label>
                {renderFilterInput()}

                {/* Active Filter Summary */}
                {(filterValue || dateRange.start || dateRange.end || amountRange.min || amountRange.max) && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">Active Filter:</p>
                    <p className="text-sm text-blue-800">
                      {selectedCategory === 'date' && (
                        <>📅 {dateRange.start || 'Any'} to {dateRange.end || 'Any'}</>
                      )}
                      {selectedCategory === 'amount' && (
                        <>💰 ₹{amountRange.min || '0'} - ₹{amountRange.max || '∞'}</>
                      )}
                      {['email', 'phone', 'status', 'payment'].includes(selectedCategory) && filterValue && (
                        <>{FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.icon} {filterValue}</>
                      )}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats - Conditional rendering as requested */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-1">
          {/* Always show these stats */}
          <Stat
            label="Total Orders"
            value={analytics.total}
          />

          {/* Show Filtered stat only when filter is active */}
          {selectedCategory && (
            <Stat
              label="Filtered"
              value={analytics.filteredTotal}
              subtitle={`${((analytics.filteredTotal / analytics.total) * 100).toFixed(1)}%`}
              blue
            />
          )}

          <Stat
            label="Completed"
            value={analytics.completed}
            green
          />

          {/* Conditional Revenue Stats - Exactly as you requested */}
          {selectedCategory ? (
            // When filter is active - show only Filtered Revenue
            <Stat
              label="Filtered Revenue"
              value={`₹${analytics.filteredRevenue.toFixed(2)}`}
              subtitle={`${((analytics.filteredRevenue / analytics.revenue) * 100).toFixed(1)}%`}
              blue
            />
          ) : (
            // When no filter - show only Total Revenue
            <Stat
              label="Total Revenue"
              value={`₹${analytics.revenue.toFixed(2)}`}
            />
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div
        ref={tableContainerRef}
        className="bg-white rounded-xl shadow h-[100vh] mb-1 overflow-y-auto"
      >
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment Type</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedOrders).map(([date, list]) => (
              <React.Fragment key={date}>
                <tr className="bg-gray-100">
                  <td colSpan="8" className="px-4 py-2 font-semibold">
                    📅 {date} <span className="text-gray-600 font-normal">({list.length} orders, ₹{list.reduce((sum, o) => sum + o.totalValue, 0).toFixed(2)})</span>
                  </td>
                </tr>
              
                {list.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-blue-50 cursor-pointer border-b transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{o.id.slice(-8)}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]" title={o.items}>
                        {o.items}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-gray-500">{o.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{o.date}</p>
                      <p className="text-xs text-gray-500">{o.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-sm">{o.total}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                        {getStatusIcon(o.status)} {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${getPaymentColor(o.payment)}`}>
                        {o.payment === 'COD' ? '💵' : '💳'} {o.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{o.fulfillmentType}</span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            {selectedCategory && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onDownloadInvoice={handleDownloadInvoice}
            invoiceLoading={invoiceLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================= MODAL ================= */
const OrderModal = ({ order, onClose, onDownloadInvoice, invoiceLoading }) => {
  const ref = useRef();

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    const outside = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();

    document.addEventListener("keydown", esc);
    document.addEventListener("mousedown", outside);
    return () => {
      document.removeEventListener("keydown", esc);
      document.removeEventListener("mousedown", outside);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={ref}
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-xl w-full max-w-xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-4">🧾 Order Details</h3>

        <div className="space-y-3 text-sm">
          <DetailRow label="Order ID" value={order.id} />
          <DetailRow label="Customer" value={order.customerName} />
          <DetailRow label="Email" value={order.email} />
          <DetailRow label="Phone" value={order.phone} />
          <DetailRow label="Date & Time" value={`${order.date} ${order.time}`} />
          <DetailRow
            label="Status"
            value={
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status}
              </span>
            }
          />
          <DetailRow
            label="Payment"
            value={<span className={getPaymentColor(order.payment)}>{order.payment}</span>}
          />
          <DetailRow
            label="Fulfillment Type"
            value={formatFulfillmentType(order.raw.fulfillmentType)}
          />
          <DetailRow label="Total" value={<span className="font-bold">{order.total}</span>} />

          <div className="mt-4">
            <p className="font-semibold mb-2">Order Items:</p>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {order.raw.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <span className="font-medium">{item.productName}</span>
                    {item.varietyName && (
                      <span className="text-gray-600 text-xs block">({item.varietyName})</span>
                    )}
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="text-gray-600 text-sm">×{item.quantity}</span>
                    <span className="ml-2 font-medium">₹{item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
            disabled={invoiceLoading}
          >
            Close
          </button>
          <button
            onClick={() => onDownloadInvoice(order)}
            disabled={invoiceLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {invoiceLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                📥 Download Invoice
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ================= DETAIL ROW ================= */
const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className="col-span-2">{value}</span>
  </div>
);

/* ================= STAT ================= */
const Stat = ({ label, value, green, blue, subtitle }) => (
  <div className="bg-white border rounded-lg px-3 py-2 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${green ? "text-green-600" : blue ? "text-blue-600" : ""}`}>
        {value}
      </p>
    </div>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </div>
);

export default OrderHistory;

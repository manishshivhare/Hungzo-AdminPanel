import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthProvider";
import { getAllOrders, getAdminOrders } from "../../Api";
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

/* ================= CSV EXPORT HELPERS ================= */
const convertToCSV = (data) => {
  const headers = [
    "Order ID",
    "Customer Email",
    "Order Items",
    "Status",
    "Date",
    "Time",
    "Total Amount (₹)",
    "Payment Method",
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
    order.customer,
    `"${order.items.replace(/"/g, '""')}"`, // Wrap in quotes and escape existing quotes
    order.status,
    order.date,
    order.time,
    order.total.replace("₹", ""),
    order.payment,
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
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create a download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/* ================= MAIN ================= */
const OrderHistory = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    if (!user?.role) return;

    const loadOrders = async () => {
      try {
        let res;

        // ✅ ROLE BASED API CALL
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
            .map(
              (i) => `${i.productName} (${i.varietyName}) × ${i.quantity}`
            )
            .join(", "),
          customer: o.userDetails?.email || o.user?.email || "—",
          status: o.orderStatus === "Delivered" ? "Completed" : o.orderStatus,
          date: formatDate(o.createdAt),
          time: formatTime(o.createdAt),
          total: `₹${o.totalAmount}`,
          payment: o.paymentMethod,
          raw: o,
        }));

        setOrders(mapped);
      } catch (e) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  /* ================= EXPORT TO CSV/EXCEL ================= */
  const exportToExcel = () => {
    try {
      setExportLoading(true);
      
      if (orders.length === 0) {
        toast.error("No orders to export");
        return;
      }

      // Convert orders to CSV format
      const csvData = convertToCSV(orders);
      
      // Generate filename with current date
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const timeStr = `${today.getHours()}-${today.getMinutes()}`;
      const fileName = `Orders_Export_${dateStr}_${timeStr}.csv`;

      // Download the CSV file
      downloadCSV(csvData, fileName);
      
      toast.success(`Exported ${orders.length} orders to CSV/Excel`);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const f =
        filter === "all" ||
        o.status.toLowerCase() === filter.toLowerCase();
      const s =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.toLowerCase().includes(searchTerm.toLowerCase());
      return f && s;
    });
  }, [orders, filter, searchTerm]);

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
    const revenue = completed.reduce(
      (sum, o) => sum + Number(o.total.replace("₹", "")),
      0
    );

    return {
      total: orders.length,
      completed: completed.length,
      revenue,
      rate: orders.length
        ? ((completed.length / orders.length) * 100).toFixed(1)
        : 0,
    };
  }, [orders]);

  // ✅ Handle invoice download using the new component
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

  if (loading) {
    return <div className="p-6 text-gray-500">Loading order history…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">📊 Order History</h2>
          
          {/* ✅ CSV/Excel Export Button */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || orders.length === 0}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              orders.length === 0
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
                📊 Export to Excel ({orders.length})
              </>
            )}
          </button>
        </div>

        <div className="flex gap-2 my-3">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="Search orders…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {["all", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total Orders" value={analytics.total} />
          <Stat label="Completed" value={analytics.completed} green />
          <Stat label="Revenue" value={`₹${analytics.revenue.toFixed(2)}`} />
          <Stat label="Success Rate" value={`${analytics.rate}%`} />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow h-[60vh] overflow-y-auto">
        <table className="w-full">
          <tbody>
            {Object.entries(groupedOrders).map(([date, list]) => (
              <React.Fragment key={date}>
                <tr className="bg-gray-100">
                  <td colSpan="5" className="p-3 font-semibold">
                    📅 {date} ({list.length})
                  </td>
                </tr>

                {list.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <td className="p-3">
                      <p className="font-semibold">{o.id}</p>
                      <p className="text-sm text-gray-500">{o.items}</p>
                    </td>
                    <td className="p-3">{o.customer}</td>
                    <td className="p-3">
                      {o.date} {o.time}
                    </td>
                    <td className="p-3">
                      <p className="font-bold">{o.total}</p>
                      <p className={`text-xs ${getPaymentColor(o.payment)}`}>
                        {o.payment}
                      </p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {getStatusIcon(o.status)} {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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

  const handleDownload = () => {
    onDownloadInvoice(order);
  };

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
          className="absolute top-2 right-3 text-xl"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-3">🧾 Order Details</h3>

        <div className="space-y-2 text-sm">
          <p><b>Order ID:</b> {order.id}</p>
          <p><b>Customer:</b> {order.customer}</p>
          <p><b>Date:</b> {order.date} {order.time}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Payment:</b> {order.payment}</p>
          <p><b>Total:</b> {order.total}</p>
          
          <div className="mt-4">
            <p className="font-semibold mb-2">Order Items:</p>
            <div className="max-h-40 overflow-y-auto">
              {order.raw.items.map((item, index) => (
                <div key={index} className="flex justify-between py-1 border-b">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    {item.varietyName && (
                      <span className="text-gray-600 text-sm"> ({item.varietyName})</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">×{item.quantity}</span>
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
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={invoiceLoading}
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={invoiceLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {invoiceLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              "Download Invoice"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ================= STAT ================= */
const Stat = ({ label, value, green }) => (
  <div className="bg-white border rounded text-center flex justify-center items-center gap-2 py-2">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-xl font-bold ${green ? "text-green-600" : ""}`}>
      {value}
    </p>
  </div>
);

export default OrderHistory;
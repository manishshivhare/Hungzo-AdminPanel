import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthProvider";
import { getAllOrders } from "../../Api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import Logo from "../../assets/Logo.png";
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

/* ================= MAIN ================= */
const OrderHistory = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await getAllOrders();
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
  }, []);

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

  if (loading) {
    return <div className="p-6 text-gray-500">Loading order history…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-2">
        <h2 className="text-xl font-bold">📊 Order History</h2>

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
          <Stat
            label="Revenue"
            value={`₹${analytics.revenue.toFixed(2)}`}
          />
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================= MODAL ================= */
const OrderModal = ({ order, onClose }) => {
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

 const downloadInvoice = () => {
  const pdf = new jsPDF("p", "mm", "a4");

  /* ================= LOGO ================= */
  const img = new Image();
  img.src = Logo;

  pdf.addImage(img, "PNG", 15, 10, 40, 20);

  /* ================= HEADER ================= */
  pdf.setFontSize(16);
  pdf.text("TAX INVOICE", 150, 20, { align: "right" });

  pdf.setFontSize(10);
  pdf.text("Your Company Name Pvt. Ltd.", 15, 35);
  pdf.text("GSTIN: 09ABCDE1234F1Z5", 15, 41);
  pdf.text("Address: Lucknow, Uttar Pradesh, India", 15, 47);

  pdf.line(15, 52, 195, 52);

  /* ================= ORDER INFO ================= */
  pdf.setFontSize(11);
  pdf.text(`Invoice No: ${order.id}`, 15, 60);
  pdf.text(`Invoice Date: ${order.date}`, 15, 66);

  pdf.text(`Customer: ${order.customer}`, 110, 60);
  pdf.text(`Payment Mode: ${order.payment}`, 110, 66);

  /* ================= TABLE HEADER ================= */
  let y = 78;
  pdf.setFontSize(10);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, y - 6, 180, 8, "F");

  pdf.text("Item", 17, y);
  pdf.text("Qty", 110, y);
  pdf.text("Price", 130, y);
  pdf.text("GST", 155, y);
  pdf.text("Total", 175, y, { align: "right" });

  /* ================= ITEMS ================= */
  y += 6;

  order.raw.items.forEach((item, i) => {
    const price = item.total;
    const gst = ((price * 5) / 100).toFixed(2); // 5% GST example
    const total = (Number(price) + Number(gst)).toFixed(2);

    pdf.text(`${i + 1}. ${item.productName} (${item.varietyName})`, 17, y);
    pdf.text(String(item.quantity), 112, y);
    pdf.text(`₹${price}`, 130, y);
    pdf.text(`₹${gst}`, 155, y);
    pdf.text(`₹${total}`, 175, y, { align: "right" });

    y += 7;
  });

  pdf.line(15, y, 195, y);
  y += 8;

  /* ================= TOTALS ================= */
  pdf.setFontSize(11);
  pdf.text(`Sub Total: ₹${order.raw.subTotal}`, 140, y, { align: "right" });
  y += 6;

  pdf.text(`GST (5%): ₹${order.raw.gstAmount}`, 140, y, { align: "right" });
  y += 6;

  pdf.text(`Delivery Charge: ₹${order.raw.deliveryCharge}`, 140, y, {
    align: "right",
  });
  y += 8;

  pdf.setFontSize(13);
  pdf.text(`Grand Total: ₹${order.raw.totalAmount}`, 140, y, {
    align: "right",
  });

  /* ================= FOOTER ================= */
  pdf.setFontSize(9);
  pdf.text(
    "This is a system generated GST invoice.",
    105,
    280,
    { align: "center" }
  );

  pdf.save(`GST_Invoice_${order.id}.pdf`);
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
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Close
          </button>
          <button
            onClick={downloadInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download Invoice
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ================= STAT ================= */
const Stat = ({ label, value, green }) => (
  <div className="bg-white border  rounded text-center flex justify-center items-center gap-2 py-2">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-xl font-bold ${green ? "text-green-600" : ""}`}>
      {value}
    </p>
  </div>
);

export default OrderHistory;

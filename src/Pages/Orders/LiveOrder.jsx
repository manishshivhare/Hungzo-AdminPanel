import React, { useEffect, useRef, useState } from "react";
import {
  getAllOrders,
  getAdminOrders,
  updateOrderStatus as updateOrderStatusAPI,
} from "../../Api";
import toast from "react-hot-toast";
import { generateInvoice } from "./generateInvoice";
import { useAuth } from "../../Context/AuthProvider";

/* ================= UTILS ================= */
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const POLL_INTERVAL = 60000;

const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Accepted",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/* ================= 🔔 NOTIFICATION SOUND ================= */
const playNewOrderSound = () => {
  const audio = new Audio("/Alert.wav");
  audio.volume = 1;
  audio.currentTime = 0;
  audio.play().catch(() => { });
};

/* ================= 🪟 NEW ORDER POPUP ================= */
const NewOrderPopup = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-96 rounded-lg p-5 shadow-xl">
        <h2 className="text-lg font-bold text-green-600">
          🛎 New Order Received
        </h2>

        <div className="mt-3 text-sm space-y-1">
          <p>
            <b>Order:</b> {order._id.substring(0, 8)}
          </p>
          <p>
            <b>Total:</b> ₹{order.totalAmount}
          </p>
          <p>
            <b>Customer:</b>{" "}
            {order.userDetails?.phone || order.userDetails?.email}
          </p>
          <p>
            <b>Time:</b> {formatTime(order.createdAt)}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const LiveOrderTable = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  // console.log(orders);

  /* 🔔 notification state */
  const [popupOrder, setPopupOrder] = useState(null);
  const lastOrderIdRef = useRef(null);

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    try {
      let res;

      if (user?.role === "SUPERADMIN") {
        res = await getAllOrders();
      } else if (user?.role === "ADMIN") {
        res = await getAdminOrders();
         console.log(res);
      } else {
        return;
      }

      if (!res?.ok) throw new Error();

      const fetchedOrders = res.data.orders || [];
      setOrders(fetchedOrders);
      setStatusDrafts((prev) => {
        const next = { ...prev };
        fetchedOrders.forEach((order) => {
          next[order._id] = next[order._id] || order.orderStatus;
        });
        return next;
      });

      /* 🔔 NEW ORDER DETECTION */
      if (
        fetchedOrders.length &&
        lastOrderIdRef.current &&
        fetchedOrders[0]._id !== lastOrderIdRef.current
      ) {
        playNewOrderSound();
        setPopupOrder(fetchedOrders[0]);
      }

      if (fetchedOrders.length) {
        lastOrderIdRef.current = fetchedOrders[0]._id;
      }
    } catch (err) {
      console.error("Load orders failed", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!user?.role) return;

    loadOrders();
    const timer = setInterval(loadOrders, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [user]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) {
      toast.error("Order not found");
      return;
    }

    if (!ORDER_STATUS_OPTIONS.includes(newStatus)) {
      toast.error(`Invalid status: ${newStatus}`);
      return;
    }

    if (order.orderStatus === newStatus) {
      toast.error("Order is already in that status");
      return;
    }

    const previous = orders;

    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: newStatus } : o
      )
    );

    const res = await updateOrderStatusAPI(orderId, newStatus);

    if (!res.ok) {
      toast.error(res.message || "Failed to update");
      setOrders(previous);
      setStatusDrafts((prev) => ({
        ...prev,
        [orderId]: order.orderStatus,
      }));
      return;
    }

    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
    toast.success(`Status updated to ${newStatus}`);
  };

  /* ================= PRINT INVOICE ================= */
  const handlePrintInvoice = (order) => {
    try {
      generateInvoice(order);
    } catch {
      toast.error("Failed to generate invoice");
    }
  };

  /* ================= STATUS BADGE ================= */
  const badge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Pending":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "Accepted":
        return `${base} bg-purple-100 text-purple-800`;
      case "Packed":
        return `${base} bg-blue-100 text-blue-800`;
      case "Out for Delivery":
        return `${base} bg-orange-100 text-orange-800`;
      case "Delivered":
        return `${base} bg-green-100 text-green-800`;
      case "Cancelled":
        return `${base} bg-red-100 text-red-800`;
      default:
        return base;
    }
  };

  /* ================= ✅ UI FILTER (ONLY CHANGE) ================= */
  const visibleOrders = orders.filter(
    (order) =>
      order.orderStatus !== "Delivered" &&
      order.orderStatus !== "Cancelled"
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Live Orders</h2>
          <p className="text-sm text-gray-500">
            Logged in as <strong>{user?.role}</strong>
          </p>
        </div>

        <div className="overflow-y-auto h-[74vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {visibleOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No active orders
                  </td>
                </tr>
              )}

              {visibleOrders.map((order) => {
                const selectedStatus =
                  statusDrafts[order._id] ?? order.orderStatus;
                const disableUpdate = selectedStatus === order.orderStatus;

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-3 font-medium">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="p-3">
                      {order.userDetails?.phone ||
                        order.userDetails?.email}
                    </td>
                    <td className="p-3 font-semibold text-center">
                      ₹{order.totalAmount}
                    </td>
                    <td className="p-3 text-xs text-gray-500 text-center">
                      {formatTime(order.createdAt)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={badge(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td
                      className="p-3 space-y-1 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [order._id]: e.target.value,
                          }))
                        }
                        className="block w-full rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => updateStatus(order._id, selectedStatus)}
                        disabled={disableUpdate}
                        className={`block w-full text-white text-xs py-1 rounded ${
                          disableUpdate
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrintInvoice={handlePrintInvoice}
        />
      )}

      <NewOrderPopup
        order={popupOrder}
        onClose={() => setPopupOrder(null)}
      />
    </>
  );
};

/* ================= MODAL ================= */
const OrderDetailsModal = ({ order, onClose, onPrintInvoice }) => (
  <div
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white/90 w-full max-w-4xl rounded-lg shadow-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="font-bold text-lg">
            Order #{order._id.substring(0, 8)}
          </h2>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPrintInvoice(order)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Print Invoice
          </button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>

      {/* CUSTOMER + ORDER INFO */}
      <div className="p-4 grid grid-cols-2 gap-4 text-sm border-b">
        <div className="space-y-1">
          <p>
            <strong>Status:</strong> {order.orderStatus}
          </p>
          <p>
            <strong>Payment:</strong> {order.paymentMethod} (
            {order.paymentStatus})
          </p>
          <p>
            <strong>Razorpay ID:</strong> {order.razorpayOrderId}
          </p>
        </div>

        <div className="space-y-1">
          <p>
            <strong>Customer:</strong>{" "}
            {order.user?.restaurantId?.ownerName || "******"}
          </p>
          <p>
            <strong>Restaurant Name:</strong>{" "}
            {console.log(order)
            }
            {order.user?.restaurantId?.name || "******"}
          </p>
          <p>
            <strong>Customer Num.:</strong>{" "}
            {order.userDetails?.phone || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {order.shippingAddress}
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-3 border-b">
        <h3 className="font-semibold mb-3">Order Items</h3>

        <div className="space-y-1 h-43 overflow-y-auto">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 border rounded-lg p-3"
            >
              {/* IMAGE */}
              <img
                src={item.product?.images?.[0]}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded border"
              />

              {/* DETAILS */}
              <div className="flex-1 text-sm space-y-1">
                <p className="font-semibold text-base">
                  {item.productName}
                </p>
                <p className="text-gray-500">
                  Variety: {item.varietyName}
                </p>
                <p className="text-gray-500">
                  Price: ₹{item.price}
                </p>
                <p className="text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <div className="font-semibold text-right">
                ₹{item.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BILL SUMMARY */}
      <div className="p-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{order.subTotal}</span>
        </div>
           <div className="flex justify-between">
          <span>PlatformFee</span>
          <span>₹{order.platformFee}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>₹{order.gstAmount}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>₹{order.deliveryCharge}</span>
        </div>

        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  </div>
);

export default LiveOrderTable;

// import React, { useEffect, useRef, useState } from "react";
// import {
//   getAllOrders,
//   getAdminOrders,
//   updateOrderStatus as updateOrderStatusAPI,
// } from "../../Api";
// import toast from "react-hot-toast";
// import { generateInvoice } from "./generateInvoice";
// import { useAuth } from "../../Context/AuthProvider";

// /* ================= UTILS ================= */
// const formatTime = (iso) =>
//   new Date(iso).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

// const POLL_INTERVAL = 60000;

// /* ================= 🔔 NOTIFICATION SOUND ================= */
// const playNewOrderSound = () => {
//   const audio = new Audio("/Alert.wav");
//   audio.volume = 1;
//   audio.currentTime = 0;
//   audio.play().catch(() => { });
// };

// /* ================= 🪟 NEW ORDER POPUP ================= */
// const NewOrderPopup = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="bg-white w-96 rounded-lg p-5 shadow-xl">
//         <h2 className="text-lg font-bold text-green-600">
//           🛎 New Order Received
//         </h2>

//         <div className="mt-3 text-sm space-y-1">
//           <p>
//             <b>Order:</b> {order._id?.substring(0, 8)}
//           </p>
//           <p>
//             <b>Total:</b> ₹{order.totalAmount}
//           </p>
//           <p>
//             <b>Customer:</b>{" "}
//             {order.userDetails?.phone || order.userDetails?.email}
//           </p>
//           <p>
//             <b>Time:</b> {formatTime(order.createdAt)}
//           </p>
//         </div>

//         <button
//           onClick={onClose}
//           className="mt-4 w-full bg-green-600 text-white py-2 rounded"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// /* ================= MAIN COMPONENT ================= */
// const LiveOrderTable = () => {
//   const { user } = useAuth();

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   console.log("Orders:", orders);

//   /* 🔔 notification state */
//   const [popupOrder, setPopupOrder] = useState(null);
//   const lastOrderIdRef = useRef(null);

//   /* ================= LOAD ORDERS ================= */
//   const loadOrders = async () => {
//     try {
//       let res;

//       if (user?.role === "SUPERADMIN") {
//         res = await getAllOrders();
//       } else if (user?.role === "ADMIN") {
//         res = await getAdminOrders();
//       } else {
//         return;
//       }

//       if (!res?.ok) throw new Error("API response not ok");
//       let fetchedOrders = [];

//       if (Array.isArray(res.data)) {
//         // Case 1: API returns array directly
//         fetchedOrders = res.data;
//       } else if (Array.isArray(res.data?.orders)) {
//         // Case 2: API returns { orders: [...] }
//         fetchedOrders = res.data.orders;
//       } else if (res.data && typeof res.data === 'object') {
//         // Case 3: API returns object with numeric keys (like your data example)
//         // Check if it has numeric keys
//         const keys = Object.keys(res.data);
//         const hasNumericKeys = keys.some(key => !isNaN(key) && key !== "__v");
        
//         if (hasNumericKeys) {
//           // Convert object with numeric keys to array
//           fetchedOrders = Object.values(res.data).filter(item =>
//             item && typeof item === 'object' && item._id
//           );
//         } else if (res.data.orders && typeof res.data.orders === 'object') {
//           const ordersObj = res.data.orders;
//           fetchedOrders = Object.values(ordersObj).filter(item =>
//             item && typeof item === 'object' && item._id
//           );
//         }
//       }


//       if (fetchedOrders.length > 0) {
//         // Log statuses for debugging
//         fetchedOrders.forEach((order, index) => {
//           // console.log(`Order ${index}: ID=${order._id?.substring(0, 8)}, Status=${order.orderStatus}, Time=${order.createdAt}`);
//         });
//       }

//       setOrders(fetchedOrders);

//       /* 🔔 NEW ORDER DETECTION */
//       if (
//         fetchedOrders.length &&
//         lastOrderIdRef.current &&
//         fetchedOrders[0]._id !== lastOrderIdRef.current
//       ) {
//         playNewOrderSound();
//         setPopupOrder(fetchedOrders[0]);
//       }

//       if (fetchedOrders.length) {
//         lastOrderIdRef.current = fetchedOrders[0]._id;
//       }
//     } catch (err) {
//       console.error("Load orders failed", err);
//       toast.error("Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= POLLING ================= */
//   useEffect(() => {
//     if (!user?.role) return;

//     loadOrders();
//     const timer = setInterval(loadOrders, POLL_INTERVAL);

//     return () => clearInterval(timer);
//   }, [user]);

//   /* ================= UPDATE STATUS ================= */
//   const updateStatus = async (orderId, newStatus) => {
//     // ✅ Check if order is already "Out for Delivery"
//     const order = orders.find(o => o._id === orderId);

//     if (order?.orderStatus === "Out for Delivery") {
//       toast.error("Cannot update status once order is out for delivery");
//       return;
//     }

//     const previous = orders;

//     // Optimistically update UI
//     setOrders((prev) =>
//       prev.map((o) =>
//         o._id === orderId ? { ...o, orderStatus: newStatus } : o
//       )
//     );

//     // Call API
//     const res = await updateOrderStatusAPI(orderId, newStatus);
    

//     if (!res.ok) {
//       toast.error(res.message || "Failed to update");
//       setOrders(previous);
//       return;
//     }

//     toast.success(`Status updated to ${newStatus}`);
    
//     // Optionally refresh orders
//     setTimeout(() => {
//       loadOrders();
//     }, 1000);
//   };

//   /* ================= PRINT INVOICE ================= */
//   const handlePrintInvoice = (order) => {
//     try {
//       generateInvoice(order);
//     } catch {
//       toast.error("Failed to generate invoice");
//     }
//   };

//   /* ================= STATUS BADGE ================= */
//   const badge = (status) => {
//     const base = "px-2 py-1 rounded-full text-xs font-semibold";
    
//     // Normalize status string
//     const normalizedStatus = status?.trim() || "Pending";
    
//     console.log("Badge for status:", status, "Normalized:", normalizedStatus);
    
//     switch (normalizedStatus) {
//       case "Pending":
//         return `${base} bg-yellow-100 text-yellow-800`;
//       case "Accepted":
//         return `${base} bg-purple-100 text-purple-800`;
//       case "Preparing":
//         return `${base} bg-blue-100 text-blue-800`;
//       case "Out for Delivery":
//       case "Out for delivery": // Handle case variations
//         return `${base} bg-orange-100 text-orange-800`;
//       case "Delivered":
//         return `${base} bg-green-100 text-green-800`;
//       case "Cancelled":
//         return `${base} bg-red-100 text-red-800`;
//       default:
//         return `${base} bg-gray-100 text-gray-800`;
//     }
//   };

//   /* ================= ✅ UI FILTER (ONLY CHANGE) ================= */
//   // Show orders that are NOT Delivered or Cancelled
//   const visibleOrders = orders.filter(
//     (order) => {
//       const status = order.orderStatus?.trim();
//       return status !== "Delivered" && status !== "Cancelled";
//     }
//   );

//   // Debug: Log visible orders
//   console.log("Visible orders count:", visibleOrders.length);
//   visibleOrders.forEach((order, index) => {
//     console.log(`Visible ${index}: ID=${order._id?.substring(0, 8)}, Status="${order.orderStatus}"`);
//   });

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-gray-500">
//         Loading orders...
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow border overflow-hidden">
//         <div className="p-4 border-b">
//           <h2 className="font-bold text-lg">Live Orders</h2>
//           <p className="text-sm text-gray-500">
//             Logged in as <strong>{user?.role}</strong>
//           </p>
//           {/* Debug info - you can remove this later */}
//           <div className="text-xs text-gray-400 mt-1">
//             Total: {orders.length} orders | Showing: {visibleOrders.length} active orders
//           </div>
//         </div>

//         <div className="overflow-y-auto h-[74vh]">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 text-left">Order ID</th>
//                 <th className="p-3 text-left">Customer</th>
//                 <th className="p-3 text-center">Total</th>
//                 <th className="p-3">Time</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y">
//               {visibleOrders.length === 0 && (
//                 <tr>
//                   <td colSpan="6" className="p-6 text-center text-gray-500">
//                     No active orders
//                   </td>
//                 </tr>
//               )}

//               {visibleOrders.map((order) => {
             
//                 const normalizedStatus = order.orderStatus?.trim();
//                 const isOutForDelivery = normalizedStatus === "Out for Delivery" || normalizedStatus === "Out for delivery";
                
//                 const canUpdate = !isOutForDelivery;

//                 const canCancel =
//                   (normalizedStatus === "Pending" ||
//                     normalizedStatus === "Accepted") && canUpdate;

//                 return (
//                   <tr
//                     key={order._id}
//                     className="hover:bg-gray-50 cursor-pointer"
//                     onClick={() => setSelectedOrder(order)}
//                   >
//                     <td className="p-3 font-medium">
//                       {order._id?.substring(0, 8)}...
//                     </td>
//                     <td className="p-3">
//                       {order.userDetails?.phone ||
//                         order.userDetails?.email}
//                     </td>
//                     <td className="p-3 font-semibold text-center">
//                       ₹{order.totalAmount}
//                     </td>
//                     <td className="p-3 text-xs text-gray-500 text-center">
//                       {formatTime(order.createdAt)}
//                     </td>
//                     <td className="p-3 text-center">
//                       <span className={badge(order.orderStatus)}>
//                         {order.orderStatus}
//                       </span>
//                     </td>

//                     <td
//                       className="p-3 space-y-1 text-center"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {/* ✅ "Out for Delivery" orders show no action buttons */}
//                       {isOutForDelivery ? (
//                         <div className="text-xs text-gray-500 py-1">
//                           Status Locked
//                         </div>
//                       ) : (
//                         <>
//                           {normalizedStatus === "Pending" && (
//                             <button
//                               onClick={() =>
//                                 updateStatus(order._id, "Accepted")
//                               }
//                               className="block w-full bg-yellow-500 text-white text-xs py-1 rounded"
//                             >
//                               Accept
//                             </button>
//                           )}

//                           {normalizedStatus === "Accepted" && (
//                             <button
//                               onClick={() =>
//                                 updateStatus(order._id, "Preparing")
//                               }
//                               className="block w-full bg-blue-500 text-white text-xs py-1 rounded"
//                             >
//                               Prepare
//                             </button>
//                           )}

//                           {normalizedStatus === "Preparing" && (
//                             <button
//                               onClick={() =>
//                                 updateStatus(
//                                   order._id,
//                                   "Out for Delivery"
//                                 )
//                               }
//                               className="block w-full bg-orange-500 text-white text-xs py-1 rounded"
//                             >
//                               Dispatch
//                             </button>
//                           )}

//                           {canCancel && (
//                             <button
//                               onClick={() => {
//                                 if (
//                                   !window.confirm("Cancel this order?")
//                                 )
//                                   return;
//                                 updateStatus(order._id, "Cancelled");
//                               }}
//                               className="block w-full bg-red-500 text-white text-xs py-1 rounded"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedOrder && (
//         <OrderDetailsModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//           onPrintInvoice={handlePrintInvoice}
//         />
//       )}

//       <NewOrderPopup
//         order={popupOrder}
//         onClose={() => setPopupOrder(null)}
//       />
//     </>
//   );
// };

// /* ================= MODAL ================= */
// const OrderDetailsModal = ({ order, onClose, onPrintInvoice }) => (
//   <div
//     className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
//     onClick={onClose}
//   >
//     <div
//       className="bg-white/90 w-full max-w-4xl rounded-lg shadow-lg overflow-hidden"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* HEADER */}
//       <div className="flex justify-between items-center p-4 border-b">
//         <div>
//           <h2 className="font-bold text-lg">
//             Order #{order._id?.substring(0, 8)}
//           </h2>
//           <p className="text-xs text-gray-500">
//             {new Date(order.createdAt).toLocaleString()}
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={() => onPrintInvoice(order)}
//             className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
//           >
//             Print Invoice
//           </button>
//           <button onClick={onClose}>✕</button>
//         </div>
//       </div>

//       {/* CUSTOMER + ORDER INFO */}
//       <div className="p-4 grid grid-cols-2 gap-4 text-sm border-b">
//         <div className="space-y-1">
//           <p>
//             <strong>Status:</strong> {order.orderStatus}
//           </p>
//           <p>
//             <strong>Payment:</strong> {order.paymentMethod} (
//             {order.paymentStatus})
//           </p>
//           <p>
//             <strong>Razorpay ID:</strong> {order.razorpayOrderId || "N/A"}
//           </p>
//         </div>

//         <div className="space-y-1">
//           <p>
//             <strong>Customer Phone:</strong>{" "}
//             {order.userDetails?.phone || "N/A"}
//           </p>
//           <p>
//             <strong>Customer Name:</strong>{" "}
//             {order.userDetails?.name || "******"}
//           </p>
//           <p>
//             <strong>Address:</strong> {order.shippingAddress}
//           </p>
//         </div>
//       </div>

//       {/* ITEMS */}
//       <div className="p-3 border-b">
//         <h3 className="font-semibold mb-3">Order Items</h3>

//         <div className="space-y-1 h-43 overflow-y-auto">
//           {order.items?.map((item) => (
//             <div
//               key={item._id}
//               className="flex gap-4 border rounded-lg p-3"
//             >
//               {/* IMAGE */}
//               <img
//                 src={item.product?.images?.[0]}
//                 alt={item.productName}
//                 className="w-20 h-20 object-cover rounded border"
//               />

//               {/* DETAILS */}
//               <div className="flex-1 text-sm space-y-1">
//                 <p className="font-semibold text-base">
//                   {item.productName}
//                 </p>
//                 <p className="text-gray-500">
//                   Variety: {item.varietyName}
//                 </p>
//                 <p className="text-gray-500">
//                   Price: ₹{item.price}
//                 </p>
//                 <p className="text-gray-500">
//                   Quantity: {item.quantity}
//                 </p>
//               </div>

//               <div className="font-semibold text-right">
//                 ₹{item.total}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BILL SUMMARY */}
//       <div className="p-4 text-sm space-y-1">
//         <div className="flex justify-between">
//           <span>Subtotal</span>
//           <span>₹{order.subTotal}</span>
//         </div>
//         <div className="flex justify-between">
//           <span>GST</span>
//           <span>₹{order.gstAmount}</span>

//         </div>
//         <div className="flex justify-between">
//           <span>Delivery</span>
//           <span>₹{order.deliveryCharge}</span>
//         </div>

//         <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
//           <span>Total</span>
//           <span>₹{order.totalAmount}</span>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default LiveOrderTable;

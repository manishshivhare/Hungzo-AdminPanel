import axios from "axios";

const API_BASE = "https://api.hungzo.in";
// const API_BASE = "http://192.168.1.50:4000";

const API = axios.create({
  baseURL: API_BASE,
});

  // Attach token automatically
  API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ================= create ADMINS ==================
export async function createAdmin(formData) {
  try {
    const res = await API.post("/admin/create", formData);
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to create admin",
    };
  }
}

// ================= WAREHOUSE ==================
export async function getWarehouses() {
  try {
    const res = await API.get("/warehouses");
    return res.data;
  } catch (error) {
    return {
      ok: false,
      success: false,
      message: error.response?.data?.message || "Failed to fetch warehouses",
    };
  }
}

export async function createWarehouse(formData) {
  try {
    const res = await API.post("/warehouses/create", formData);
    return res.data;
  } catch (error) {
    return {
      ok: false,
      success: false,
      message: error.response?.data?.message || "Failed to create warehouse",
    };
  }
}

export async function updateWarehouse(id, formData) {
  try {
    const res = await API.put(`/warehouses/update/${id}`, formData);
    return res.data;
  } catch (error) {
    return {
      ok: false,
      success: false,
      message: error.response?.data?.message || "Failed to update warehouse",
    };
  }
}

export async function deleteWarehouse(id) {
  try {
    const res = await API.delete(`/warehouses/delete/${id}`);
    return res.data;
  } catch (error) {
    return {
      ok: false,
      success: false,
      message: error.response?.data?.message || "Failed to delete warehouse",
    };
  }
}

// ================= DELETE ADMIN ==================
export async function deleteAdmin(id) {
  try {
    const res = await API.delete(`${API_BASE}/admin/delete/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting admin:", error.response?.data || error.message);
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to delete admin",
    };
  }
}
// ================= ADMIN List ==================
export async function AdminList() {
  try {
    const res = await API.get(`${API_BASE}/admin/list`);
    return res.data;
  } catch (error) {
    console.error("Error fetching admin list:", error.response?.data || error.message);
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to fetch admin list",
    };
  }
}

// ================= RESTAURANT ==================


// ================= RESTAURANTLIST ==================

export async function restaurantprofile() {
  try {
    const res = await API.get("/restaurants/profile");
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}
// ================= Only Logged User RESTAURANTLIST ==================

export async function restaurantOnlyLogged() {
  try {
    const res = await API.get("/admin/dashboard/pending-users");
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}

// ================= RESTAURANT PENDING LIST ==================
export async function restaurantList() {
  try {
    const res = await API.get("/admin/dashboard/restaurants/pending");
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}
// ================= RESTAURANT rejected LIST ==================
export async function restaurantRejected() {
  try {
    const res = await API.get("/admin/dashboard/restaurants/rejected");
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}
// =================  APPROVEd RESTAURANT LIST ==================
export async function restaurantApproved() {
  try {
    const res = await API.get("/admin/dashboard/restaurants/verified");
    // console.log(res);

    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}


// ================= RESTAURANT APPROVE =================
export async function approveRestaurantReq(id) {
  try {
    const res = await API.post(
      `${API_BASE}/admin/restaurants/approve/${id}`
    );
    return res.data;
  } catch (error) {
    console.error(
      `restaurants/approve/${id}`,
      error.response?.data || error.message
    );
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to approve restaurant",
    };
  }
}

// ================= RESTAURANT REJECT =================
export async function rejectRestaurantReq(id) {
  try {
    const res = await API.post(
      `${API_BASE}/admin/restaurants/reject/${id}`
    );
    return res.data;
  } catch (error) {
    console.error(
      `restaurants/reject/${id}`,
      error.response?.data || error.message
    );
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to reject restaurant",
    };
  }
}


// ================= Drivers ==================


// ================= Drivers Penddind LIST ==================

export async function DriversList() {
  try {
    const res = await API.get("/admin/dashboard/drivers/pending");
    // console.log(res.data);
    return res.data;
  }
  catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch Driver list",
    };
  }
}


// =================  rejected Driver LIST ==================
export async function DriverRejected() {
  try {
    const res = await API.get("/admin/dashboard/drivers/rejected");
    console.log(res.data);

    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}
// =================  APPROVED Driver LIST ==================
export async function DriverApproved() {
  try {
    const res = await API.get("admin/dashboard/drivers/verified");
    // console.log(res);
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch restaurant list",
    };
  }
}
// ================= Driver APPROVE =================
export async function approveDriverReq(id) {
  try {
    const res = await API.post(
      `${API_BASE}/admin/drivers/approve/${id}`
    );
    return res.data;
  } catch (error) {
    console.error(
      `drivers/approve/${id}`,
      error.response?.data || error.message
    );
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to approve  dreivers",
    };
  }
}

// ================= Driver REJECT =================
export async function rejectDriverReq(id) {
  try {
    const res = await API.post(
      `${API_BASE}/admin/drivers/reject/${id}`
    );
    return res.data;
  } catch (error) {
    console.error(
      `drivers/reject/${id}`,
      error.response?.data || error.message
    );
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to reject driver",
    };
  }
}

// ////////////////// Driver Order ////////
export async function DriverOrder(driverId) {
  try {
    const res = await API.get(`/admin/dashboard/drivers/${driverId}/orders`);
    console.log(res);
    return res.data;
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch driver orders",
    };
  }
}
// =================  =================

/* ================= FETCH CATEGORIES ================= */
export async function fetchCategories() {
  try {
    const res = await API.get("/categories/all");
    return {
      ok: true,
      categories: res.data.categories,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch categories",
    };
  }
}

/* ================= CREATE CATEGORY ================= */
export async function addCategory(name) {
  try {
    const res = await API.post("/categories/create", { name });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to create category",
    };
  }
}

/* ================= CREATE PRODUCT ================= */
export async function createProduct(formData) {
  try {
    const res = await API.post("/products/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to create product",
    };
  }
}



/* ================= GET ALL ACTIVE PRODUCTS (PUBLIC) ================= */
export async function getActiveProducts() {
  try {
    const res = await API.get("/products");
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch products",
    };
  }
}

/* ================= GET PRODUCT BY ID (PUBLIC) ================= */
export async function getProductById(id) {
  try {
    const res = await API.get(`/products/${id}`);
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch product",
    };
  }
}

/* ================= MY PRODUCTS (ADMIN) ================= */
export async function myProducts() {
  try {
    const res = await API.get("/products/admin/my");
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch my products",
    };
  }
}

/* ================= UPDATE PRODUCT (ADMIN) ================= */
export async function updateProduct(id, formData) {
  try {
    const res = await API.put(`/products/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Update Product Error:", error.response?.data || error.message);
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to update product",
    };
  }
}

/* ================= DELETE PRODUCT (ADMIN) ================= */
export async function deleteProduct(id) {
  try {
    const res = await API.delete(`/products/delete/${id}`);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Delete Product Error:", error.response?.data || error.message);
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to delete product",
    };
  }
}


/* =================  ORDERS API ================= */

/* ================= GET ADMIN ORDERS ================= */
export async function getAdminOrders() {
  try {
    const res = await API.get("/orders/admin");
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to fetch admin orders",
    };
  }
}


/* ================= GET ALL ORDERS (SUPERADMIN) ================= */
export async function getAllOrders() {
  try {
    const res = await API.get("/orders/all");
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to fetch all orders",
    };
  }
}

/* ================= GET ORDERS BY USER ================= */
export async function getOrdersByUser(userId) {
  try {
    const res = await API.get(`/orders/admin/user/${userId}`);
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch user orders",
    };
  }
}


/* ================= UPDATE ORDER STATUS ================= */
export async function updateOrderStatus(orderId, status) {
  try {
    const res = await API.put(`/orders/status/${orderId}`, { orderStatus: status });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to update order status",
    };
  }
}

export async function approveOrderRefund(orderId) {
  try {
    const res = await API.post(`/orders/${orderId}/refund/approve`);
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to approve order refund",
    };
  }
}

export async function assignWarehouseToOrder(orderId, warehouseId) {
  try {
    const res = await API.put(`/orders/warehouse/${orderId}`, { warehouseId });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to assign warehouse",
    };
  }
}


/* ================= GET SINGLE ORDER ================= */
export async function getOrderById(orderId) {
  try {
    const res = await API.get(`/orders/${orderId}`);
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || "Failed to fetch order",
    };
  }
}


/* ================= GET ADMIN RETURN ORDERS ================= */
export async function getReturnOrders() {
  try {
    const res = await API.get("/returns/admin/all");
    console.log(res);

    return { ok: true, data: res.data };
  } catch (error) {
    console.error(
      "Error fetching return orders:",
      error.response?.data || error.message
    );

    return {
      ok: false,
      error: error.response?.data || {
        message: "Failed to fetch return orders",
      },
    };
  }
}

/* ================= APPROVE / REJECT RETURN REQUEST ================= */
export async function updateReturnStatus(returnId, status, adminRemark = "") {
  try {
    const res = await API.put(`/returns/${returnId}`, {
      status,
      adminRemark,
    });

    return { ok: true, data: res.data };
  } catch (error) {
    console.error(
      "Update Return Status Error:",
      error.response?.data || error.message
    );

    return {
      ok: false,
      error: error.response?.data || {
        message: "Failed to update return status",
      },
    };
  }
}



// ================= Banner ==================
// ================= create Banner ==================
export async function createBanner(formData) {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const res = await API.post("/banners/create", formData, config);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Create banner error:", error);
    console.error("Error response:", error.response?.data);

    return {
      ok: false,
      message: error.response?.data?.message || error.response?.data?.error || "Failed to create banner",
      error: error.response?.data,
    };
  }
}
// =================get  BannerLIST ==================

export async function BannersList() {
  try {
    const res = await API.get("/banners/all");
    // console.log(res.data);
    return res.data;
  }
  catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch Driver list",
    };
  }
}
/* ================= DELETE Banner ================= */
export async function DeleteBanner(id) {
  try {
    const res = await API.delete(`/banners/delete/${id}`);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("Delete Product Error:", error.response?.data || error.message);
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to delete product",
    };
  }
}

/* ================= UPDATE Banner ================= */

export async function updateBanner(id, formData) {
  try {
    const res = await API.put(
      `/banners/update/${id}`,
      formData
    );

    return { ok: true, data: res.data };
  } catch (error) {
    console.error(
      "Update Banner Error:",
      error.response?.data || error.message
    );

    return {
      ok: false,
      message: error.response?.data?.message || "Failed to update banner",
    };
  }
}


//  ////////// Wallet ////////
// =================get  Wallet LIST ==================

export async function WalletList() {
  try {
    const res = await API.get("/wallet/admin/all");

    return res.data;
  }
  catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch Wallet list",
    };
  }
}

// ================= USER TRANSACTIONS WITH PAGINATION ==================
export async function getUserTransactions(userId, page = 1, limit = 20) {
  try {
    const res = await API.get(`/wallet/admin/user/${userId}/transactions`, {
      params: {
        page,
        limit
      }
    });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch user transactions",
    };
  }
}

// ================= ALTERNATIVE VERSION WITH FLEXIBLE PARAMS ==================
export async function getUserTransactionsWithParams(userId, params = {}) {
  try {
    const res = await API.get(`/wallet/admin/user/${userId}/transactions`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        ...params
      }
    });
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to fetch user transactions",
    };
  }
}

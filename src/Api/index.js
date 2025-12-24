import axios from "axios";

const API_BASE = "http://localhost:4000";

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
    const res = await API.post("/admin/create", formData); // ✅ FIXED URL
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data?.message || "Failed to create admin",
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
    console.log(res);

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
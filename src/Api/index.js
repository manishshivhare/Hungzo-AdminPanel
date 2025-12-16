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

// ================= RESTAURANT PENDING LIST ==================
export async function restaurantList() {
  try {
    const res = await API.get ("/admin/restaurants/pending");
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

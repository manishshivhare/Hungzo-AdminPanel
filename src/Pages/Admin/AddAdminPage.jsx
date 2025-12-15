import React, { useState } from "react";
import toast from "react-hot-toast";
import { createAdmin } from "../../Api/index";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlusIcon, UserIcon, LockClosedIcon, ShieldCheckIcon, } from "@heroicons/react/24/outline";
export default function AddAdminPage({ onCreated }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "", role: "admin",});
  const [loading, setLoading] = useState(false);

  const roles = ["superadmin", "admin"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await createAdmin(form);
      toast.success("Admin created successfully");
      onCreated?.(res.data);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <UserPlusIcon className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Admin</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new administrator account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Creating..." : "Create Admin"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/Store.png";
import logo from "../../assets/Logo.png";
import {UserIcon,LockClosedIcon,EyeIcon,EyeSlashIcon,} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthProvider";
import { motion } from "framer-motion";

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fieldVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// 🔒 Password strength logic (UI only)
const getStrength = (password) => {
  if (password.length === 0) return { label: "", color: "" };
  if (password.length < 4) return { label: "Weak", color: "bg-rose-500" };
  if (/[A-Z]/.test(password) && /\d/.test(password))
    return { label: "Strong", color: "bg-emerald-600" };
  return { label: "Medium", color: "bg-amber-500" };
};

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ⌨️ Show password while holding ALT
  useEffect(() => {
    const down = (e) => e.altKey && setShowPassword(true);
    const up = () => setShowPassword(false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const strength = getStrength(password);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username || !password) {
    toast.error("Username & Password required");
    return;
  }

  const res = await login({ username, password });

  if (res.ok) {
    toast.success("Login Successful!");
    navigate("/", { replace: true });
  } else {
    toast.error(res.message);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-10 rounded-[28px] 
                   shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-200"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <motion.img
            src={logo}
            alt="Logo"
            className="w-24 h-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={formVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* Username */}
          <motion.div variants={fieldVariants} className="relative">
            <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2
                         text-slate-700 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={fieldVariants} className="relative">
            <LockClosedIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setShowPassword(false)}
              // onPaste={(e) => e.preventDefault()}
              className="w-full border border-slate-300 rounded-md pl-10 pr-10 py-2
                         text-slate-700 placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </motion.button>
          </motion.div>

          {/* Login Button */}
          <motion.button
            variants={fieldVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-md font-semibold
                       hover:bg-emerald-700 focus:outline-none
                       focus:ring-2 focus:ring-emerald-500"
          >
            LOGIN
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

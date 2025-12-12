import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
const STORAGE_KEY = "ecom_admin_auth";

// TEMP demo login
const DEMO = { username: "admin", password: "admin1234" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async ({ username, password }) => {
    if (username === DEMO.username && password === DEMO.password) {
      const payload = { username, token: "demo-token" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setUser(payload);
      return { ok: true, data: payload };
    }
    return { ok: false, message: "Invalid credentials" };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

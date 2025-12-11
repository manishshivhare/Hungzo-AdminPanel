import React from "react";
import Sidebar from "../Components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

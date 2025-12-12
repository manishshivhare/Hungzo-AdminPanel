
import React from "react";
import { useAuth } from "../../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = (confirm) => {
    if (confirm) {
      logout();    
      toast.error("log Out")
    } else {
      navigate(-1);     }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">
        Are you sure you want to logout?
      </h1>
      <div className="space-x-4">
        <button
          onClick={() => handleConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Yes, Logout
        </button>
        <button
          onClick={() => handleConfirm(false)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-20 opacity-80" />
        </div>

        {/* 404 Title */}
        <h1 className="text-6xl font-extrabold text-red-500 tracking-wider">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-gray-700 mt-4 text-lg font-medium">
          Oops! The page you're looking for doesn't exist.
        </p>

        {/* Description */}
        <p className="text-gray-500 mt-2 text-sm">
          It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="mt-6 inline-block bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 cursor-pointer"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

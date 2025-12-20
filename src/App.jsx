import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import ProtectedRoute from './Components/ProtectedRoute'
import LogoutPage from './Pages/auth/LogoutPage'
import NotFound from './Pages/auth/NotFound'
import OrdersPage from './Pages/Orders/OrdersPage'
import Sidebar from './Components/Sidebar'
import Login from './Pages/auth/Login'
import Verifications from './Pages/verification/Verifications'
import Suppliers from './Pages/Suppliers/Suppliers'
import Driver from './Pages/Drivers/Drivers'
import AddAdminPage from './Pages/Admin/AddAdminPage'
import AdminListPage from './Pages/Admin/AdminListPage'
import Restaurants from './Pages/restaurants/Restaurants'
import ProductsList from './Pages/Product/ProductsList'
import AddProduct from './Pages/Product/AddProduct'
import LiveOrder from './Pages/Orders/LiveOrder'

export default function App() {
  const location = useLocation()

  // Hide sidebar + header on login page
  const noSidebar = location.pathname === '/login'

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">

      <Toaster position="top-center" />

      {/* Sidebar visible only when logged in */}
      {!noSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col">

        {/* REMOVE PADDING → full area */}
        <main className="flex-1 w-full h-full ">
          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><LogoutPage /></ProtectedRoute>} />
            <Route path="/restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><Verifications /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute><Driver /></ProtectedRoute>} />
            <Route path="/add-admin" element={<ProtectedRoute><AddAdminPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminListPage /></ProtectedRoute>} />
            <Route path='/product' element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
            <Route path='/add-product' element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </main>
      </div>
    </div>
  )
}

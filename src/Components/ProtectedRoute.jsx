import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../auth/AuthProvider'

export default function ProtectedRoute({ children }) {
  // const { isAuthenticated } = useAuth()
  const token = localStorage.getItem('token')
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

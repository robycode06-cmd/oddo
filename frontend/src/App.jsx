import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EmployeeDashboard from './components/EmployeeDashboard'

// Placeholder for Admin Dashboard (will be replaced with full component)
const AdminDashboard = () => (
  <div className="min-h-screen bg-[#f4f1f3] flex flex-col items-center justify-center p-6">
    <div className="bg-white border border-purple-100 p-8 rounded-2xl shadow-lg max-w-md text-center">
      <h1 className="text-2xl font-bold text-[#714B67]">Admin Dashboard</h1>
      <p className="text-sm text-[#9C8195] mt-2">Welcome! You have signed in with Admin/HR privileges.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <div>
      <Routes>
        {/* Default route redirects to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Signup />} />

        {/* Dashboard Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </div>
  )
}

export default App
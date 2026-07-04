import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard' // <-- Import the new AdminDashboard page
import { useAuth } from './context/authContext'

// Simple placeholder for normal employee view
const EmployeeDashboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 text-gray-900 flex flex-col items-center justify-center p-6">
    <div className="bg-white/90 backdrop-blur-xl border border-purple-100 p-8 rounded-3xl shadow-2xl max-w-md text-center">
      <h1 className="text-2xl font-bold text-purple-700">Employee Dashboard</h1>
      <p className="text-sm text-gray-500 mt-2">Welcome to the HR Portal Employee View!</p>
    </div>
  </div>
);

const App = () => {
  const { user } = useAuth();

  const getDashboardPath = (role) => {
    return role === 'Admin' || role === 'HR' ? '/admin-dashboard' : '/dashboard';
  };

  return (
    <div>
      <Routes>
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to={getDashboardPath(user.role)} replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/login" 
          element={
            user 
              ? <Navigate to={getDashboardPath(user.role)} replace /> 
              : <Login />
          } 
        />
        
        <Route path="/signup" element={<Signup />} />
        
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        <Route path="/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </div>
  )
}

export default App
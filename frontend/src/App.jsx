import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup';

// Simple placeholder views for testing redirection
const AdminDashboard = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-md text-center">
      <h1 className="text-2xl font-bold text-emerald-400">Admin Dashboard</h1>
      <p className="text-sm text-slate-400 mt-2">Welcome! You have successfully signed in with Admin/HR privileges.</p>
    </div>
  </div>
);

const EmployeeDashboard = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-md text-center">
      <h1 className="text-2xl font-bold text-blue-400">Employee Dashboard</h1>
      <p className="text-sm text-slate-400 mt-2">Welcome! You have successfully signed in to the Employee Portal.</p>
    </div>
  </div>
);
//above are samples need to remove
const App = () => {
  return (
    <div>
      <Routes>
        {/* Default route redirects to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        <Route path='/create' element={<Signup/>}></Route>
        {/* Dashboard Redirections */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </div>
  )
}

export default App
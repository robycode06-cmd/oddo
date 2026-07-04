import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './components/EmployeeDashboard'
import EmployeeProfile from './components/EmployeeProfileComponents/EmployeeProfile'
import { useAuth } from './context/authContext'

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
        
        {/* Dashboard Routes */}
        <Route path="/admin-dashboard" element={user && (user.role === 'Admin' || user.role === 'HR') ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <EmployeeDashboard /> : <Navigate to="/login" />} />
        
        {/* Profile Routes */}
        <Route path="/profile/:id" element={user ? <EmployeeProfile currentUser={user} /> : <Navigate to="/login" />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
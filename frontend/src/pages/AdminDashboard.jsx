import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../../axios_api/axios';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // Tracks ID of employee to delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({}); // Tracks password visibility for each row

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. Authorization Gate
  const isAuthorized = user && (user.role === 'Admin' || user.role === 'HR');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/create'); // Hits GET /create
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchEmployees();
    }
  }, [isAuthorized]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/create/${id}`); // Hits DELETE /create/:id
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 text-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl border border-purple-100 p-8 rounded-3xl shadow-2xl max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-gray-500 mt-2">Only administrators and HR personnel can access this dashboard.</p>
          <Link to="/dashboard" className="mt-6 inline-block w-full rounded-xl bg-gray-800 hover:bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 flex flex-col p-4 sm:p-6 relative overflow-hidden text-gray-900">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-200/20 blur-[100px] pointer-events-none" />

      {/* Navbar Container */}
      <div className="w-full max-w-6xl mx-auto mb-6">
        <div className="bg-white/80 backdrop-blur-md border border-purple-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-[#614058]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HR Admin Panel</h1>
              <p className="text-xs text-gray-500">Logged in as {user?.profile?.firstName} ({user?.role})</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link 
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#714B68] hover:bg-[#9C8194] px-4 py-2.5 text-sm font-semibold text-white shadow transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </Link>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-slate-50 text-sm font-semibold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 bg-white/90 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-purple-100 pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Employee Registry</h2>
          <span className="text-xs text-gray-500 bg-purple-100 text-[#614058] px-2.5 py-1 rounded-md font-semibold">
            {employees.length} Records
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-8 w-8 text-[#714B68]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-500">Loading directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Login ID</th>
                  <th className="py-3.5 px-4">Password</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-purple-50/50 hover:bg-purple-50/20 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {emp.profile?.firstName} {emp.profile?.lastName}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{emp.email}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#714B68]">{emp.loginId}</td>
                    <td className="py-4 px-4 text-gray-600 font-mono">
                      <div className="flex items-center gap-2">
                        <span>{showPasswords[emp._id] ? (emp.tempPassword || 'N/A') : '••••••••'}</span>
                        {emp.tempPassword && (
                          <button
                            onClick={() => togglePasswordVisibility(emp._id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            type="button"
                            title={showPasswords[emp._id] ? "Hide password" : "Show password"}
                          >
                            {showPasswords[emp._id] ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        emp.role === 'Admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                        emp.role === 'HR' ? 'bg-purple-100 text-[#614058] border border-purple-200' :
                        'bg-slate-100 text-gray-600'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {deleteConfirmId === emp._id ? (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleDelete(emp._id)}
                            disabled={deleteLoading}
                            className="bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-700 shadow transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleteLoading}
                            className="bg-slate-200 text-gray-700 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(emp._id)}
                          disabled={user.id === emp._id} // Disable delete button for the logged-in user
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            user.id === emp._id
                              ? 'border-gray-250 text-gray-300 cursor-not-allowed'
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No employee accounts registered. Click "Add Employee" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../../axios_api/axios';
import AdminAttendanceTable from '../components/AdminAttendanceTable';
import AdminLeaveTable from '../components/AdminLeaveTable';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'attendance', 'leaves'

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAuthorized = user && (user.role === 'Admin' || user.role === 'HR');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/create');
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
      await api.delete(`/create/${id}`);
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
      <div className="min-h-screen bg-[#f4f1f3] text-[#392634] flex items-center justify-center p-4">
        <div className="bg-white border border-[#F1EDF0] p-8 rounded-2xl shadow-sm max-w-md text-center">
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="text-sm text-[#9C8195] mt-2">Only administrators and HR personnel can access this dashboard.</p>
          <Link to="/dashboard" className="mt-6 inline-block w-full rounded-md bg-[#714B67] hover:bg-[#4F3548] py-2.5 text-sm font-semibold text-white transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1f3] flex flex-col py-10 px-6 sm:px-10 text-[#392634]">
      
      {/* Header Container Card */}
      <div className="w-full max-w-7xl mx-auto mb-8 bg-white border border-[#F1EDF0] rounded-2xl shadow-[0_1px_3px_rgba(113,75,103,0.08)] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-[#F4EFF2] text-[#714B67]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">HR Admin Panel</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Logged in as {user?.profile?.firstName} ({user?.role})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/signup"
            className="px-4 py-2.5 rounded-lg bg-[#714B67] hover:bg-[#5C3D54] text-sm font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-[#F1EDF0] rounded-2xl shadow-[0_1px_3px_rgba(113,75,103,0.08)]">
        <div className="px-6 py-5 flex justify-between items-center border-b border-[#F1EDF0]">
          <h2 className="text-base font-bold text-gray-800">Employee Registry</h2>
          <span className="text-xs font-bold text-[#714B67] bg-[#F4EFF2] px-2.5 py-1 rounded-lg">
            {employees.length} {employees.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border-b border-[#F1EDF0] text-[#991B1B] px-6 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-6 w-6 text-[#714B67]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-[#9C8195]">Loading directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FDFCFD] border-b border-[#F1EDF0]">
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Login ID</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Password</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-[#F1EDF0] last:border-0 hover:bg-[#faf8f9] transition-colors group">
                    <td className="py-4 px-6">
                      <Link to={`/profile/${emp._id}`} className="font-bold text-gray-800 hover:text-[#714B67] transition-colors">
                        {emp.profile?.firstName} {emp.profile?.lastName}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">{emp.email}</td>
                    <td className="py-4 px-6 font-bold text-[#714B67] font-mono text-xs">{emp.loginId}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{showPasswords[emp._id] ? (emp.tempPassword || '••••••••') : '••••••••'}</span>
                        {emp.tempPassword && (
                          <button
                            onClick={() => togglePasswordVisibility(emp._id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            type="button"
                          >
                            {showPasswords[emp._id] ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        emp.role === 'Admin' ? 'bg-red-50 text-red-600' :
                        emp.role === 'HR' ? 'bg-[#F4EFF2] text-[#714B67]' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {deleteConfirmId === emp._id ? (
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(emp._id)}
                            disabled={deleteLoading}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleteLoading}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setDeleteConfirmId(emp._id)}
                            disabled={user.id === emp._id}
                            className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                              user.id === emp._id
                                ? 'border-gray-100 bg-white text-gray-300 cursor-not-allowed'
                                : 'border-red-100 bg-white text-red-500 hover:bg-red-50 hover:border-red-200'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <p className="text-sm font-medium text-[#392634]">No employees found</p>
                      <p className="text-xs text-[#9C8195] mt-1">Click Add Employee to register a new user.</p>
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
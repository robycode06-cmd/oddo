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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

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
      
      {/* Header Container */}
      <div className="w-full max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#EAE5E9] text-[#714B67]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#392634]">Employees</h1>
            <p className="text-sm text-[#9C8195]">Logged in as {user?.profile?.firstName} ({user?.role})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="px-4 py-2 rounded-md bg-white border border-[#F1EDF0] text-[#392634] hover:bg-[#F9F9FB] text-sm font-semibold transition-all"
          >
            Sign Out
          </button>
          <Link 
            to="/signup"
            className="px-4 py-2 rounded-md bg-[#714B67] hover:bg-[#4F3548] text-sm font-semibold text-white transition-all shadow-sm"
          >
            Create
          </Link>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full max-w-7xl mx-auto bg-white border border-[#F1EDF0] rounded-lg shadow-[0_1px_3px_rgba(113,75,103,0.08)]">
        <div className="px-6 py-4 flex justify-between items-center border-b border-[#F1EDF0]">
          <h2 className="text-sm font-semibold text-[#392634]">All Employees</h2>
          <span className="text-xs font-bold text-[#714B67] bg-[#F1EDF0] px-2 py-0.5 rounded-md">
            {employees.length}
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
                  <th className="py-3 px-6 text-xs font-semibold text-[#9C8195] uppercase tracking-widest">Name</th>
                  <th className="py-3 px-6 text-xs font-semibold text-[#9C8195] uppercase tracking-widest">Work Email</th>
                  <th className="py-3 px-6 text-xs font-semibold text-[#9C8195] uppercase tracking-widest">Login ID</th>

                  <th className="py-3 px-6 text-xs font-semibold text-[#9C8195] uppercase tracking-widest">Department/Role</th>
                  <th className="py-3 px-6 text-xs font-semibold text-[#9C8195] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-[#F1EDF0] last:border-0 hover:bg-[#faf8f9] transition-colors group">
                    <td className="py-4 px-6">
                      <Link to={`/profile/${emp._id}`} className="font-semibold text-[#392634] hover:text-[#714B67] transition-colors">
                        {emp.profile?.firstName} {emp.profile?.lastName}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-[#585D68]">{emp.email}</td>
                    <td className="py-4 px-6 font-mono text-[#714B67] text-xs">{emp.loginId}</td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                        emp.role === 'Admin' ? 'bg-[#FEF2F2] text-[#991B1B]' :
                        emp.role === 'HR' ? 'bg-[#F1EDF0] text-[#714B67]' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {deleteConfirmId === emp._id ? (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleDelete(emp._id)}
                            disabled={deleteLoading}
                            className="bg-[#EF4444] text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#DC2626] transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleteLoading}
                            className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                          <Link 
                            to={`/profile/${emp._id}`}
                            className="text-xs font-semibold text-[#714B67] hover:text-[#4F3548] bg-[#F1EDF0] px-3 py-1.5 rounded"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(emp._id)}
                            disabled={user.id === emp._id}
                            className={`text-xs font-semibold px-3 py-1.5 rounded transition-all ${
                              user.id === emp._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#FEF2F2] text-[#991B1B] hover:bg-[#EF4444] hover:text-white'
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
                      <p className="text-xs text-[#9C8195] mt-1">Click Create to add a new employee.</p>
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
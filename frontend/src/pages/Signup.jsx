import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../../axios_api/axios'; // Resolves to frontend/axios_api/axios.js

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Employee',
    phone: '',
    address: '',
    joiningYear: new Date().getFullYear(),
    salaryBase: '',
    salaryHra: '',
    salaryAllowances: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null); // Stores created user credentials
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Role-based Protection: Only Admin or HR can access this page
  const isAuthorized = user && (user.role === 'Admin' || user.role === 'HR');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 text-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl border border-purple-100 p-8 rounded-3xl shadow-2xl max-w-md text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-50 text-red-600 border border-red-100 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-gray-500 mt-2">
            Only administrators and HR personnel can register new employees.
          </p>
          <Link 
            to="/dashboard" 
            className="mt-6 inline-block w-full rounded-xl bg-gray-800 hover:bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPwd(true);
        setTimeout(() => setCopiedPwd(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      joiningYear: parseInt(formData.joiningYear, 10),
      phone: formData.phone,
      address: formData.address,
      salary: {
        base: Number(formData.salaryBase) || 0,
        hra: Number(formData.salaryHra) || 0,
        allowances: Number(formData.salaryAllowances) || 0
      }
    };

    try {
      const response = await api.post('/create', payload);

      setSuccessData({
        loginId: response.data.employee.loginId,
        tempPassword: response.data.tempPassword,
        email: response.data.employee.email
      });

      // Clear Form state
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Employee',
        phone: '',
        address: '',
        joiningYear: new Date().getFullYear(),
        salaryBase: '',
        salaryHra: '',
        salaryAllowances: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-purple-100/30 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Header */}
        <div className="border-b border-purple-100 pb-5 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Register New Employee</h2>
            <p className="text-sm text-gray-500 mt-1">Create an employee account and generate security credentials.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#714B68] hover:text-[#9C8194] text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Dynamic Display */}
        {successData ? (
          /* SUCCESS VIEW - SHOW CREDENTIALS */
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4 bg-purple-50/50 border border-purple-100 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-[#614058]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-2">Registration Successful</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Copy the login credentials below. For security, this password will not be displayed again.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-purple-100 p-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Login ID</label>
                <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3">
                  <span className="font-mono text-gray-900 font-bold tracking-wider text-md">{successData.loginId}</span>
                  <button 
                    onClick={() => handleCopy(successData.loginId, 'id')}
                    className="text-white text-xs bg-[#714B68] hover:bg-[#9C8194] px-4 py-2 rounded-lg transition-colors font-semibold shadow"
                  >
                    {copiedId ? 'Copied!' : 'Copy ID'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Temporary Password</label>
                <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3">
                  <span className="font-mono text-gray-900 font-bold tracking-wider text-md">
                    {showPassword ? successData.tempPassword : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 p-1.5 transition-colors"
                      type="button"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={() => handleCopy(successData.tempPassword, 'pwd')}
                      className="text-white text-xs bg-[#714B68] hover:bg-[#9C8194] px-4 py-2 rounded-lg transition-colors font-semibold shadow"
                    >
                      {copiedPwd ? 'Copied!' : 'Copy Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-purple-100">
              <button
                onClick={() => setSuccessData(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#714B68] hover:bg-[#9C8194] font-semibold text-sm text-white shadow-lg transition-all active:scale-[0.98]"
              >
                Register Another Employee
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1 */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#714B68] uppercase tracking-widest border-b border-purple-100 pb-1.5">1. Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g., John"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g., Doe"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., employee@company.com"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 82934XXXXX"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Home Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, Country"
                  className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#714B68] uppercase tracking-widest border-b border-purple-100 pb-1.5">2. Position & Role</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Role Type</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white border border-gray-305 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  >
                    <option value="Employee">Employee (Standard)</option>
                    <option value="HR">HR Manager</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Year of Joining</label>
                  <input
                    type="number"
                    name="joiningYear"
                    required
                    value={formData.joiningYear}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#714B68] uppercase tracking-widest border-b border-purple-100 pb-1.5">3. Salary Structure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Base Salary (₹)</label>
                  <input
                    type="number"
                    name="salaryBase"
                    min="0"
                    value={formData.salaryBase}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">HRA (₹)</label>
                  <input
                    type="number"
                    name="salaryHra"
                    min="0"
                    value={formData.salaryHra}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Allowances (₹)</label>
                  <input
                    type="number"
                    name="salaryAllowances"
                    min="0"
                    value={formData.salaryAllowances}
                    onChange={handleChange}
                    placeholder="e.g. 800"
                    className="w-full rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-purple-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#714B68] hover:bg-[#9C8194] text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Employee'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
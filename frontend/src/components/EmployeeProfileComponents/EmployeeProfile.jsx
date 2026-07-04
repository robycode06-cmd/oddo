import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SalaryInfoTab from './SalaryInfoTab';

const EmployeeProfile = ({ currentUser, onProfileUpdated }) => {
  const { id } = useParams(); // Retrieves the employee ID from route parameters (/profile/:id)
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Tabs layout settings based on roles
  const isStaff = currentUser?.role === 'Admin' || currentUser?.role === 'HR';
  const tabs = isStaff 
    ? ['Resume', 'Private Info', 'Salary Info', 'Security']
    : ['Resume', 'Private Info'];

  const [activeTab, setActiveTab] = useState('Private Info');

  // Form State - Private Info
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Form State - Security credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // 1. Fetch employee details on mount / parameter render
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError('');

        /* ==========================================
           CORE LOGIC FOR FETCHING SINGLE EMPLOYEE PROFILE BY ID
           ==========================================
           TODO: Implement the API fetch request here.
           Example implementation:
           
           const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
           const response = await axios.get(`${API_BASE_URL}/users/profile/${id}`, { withCredentials: true });
           if (response.data.success) {
             const empData = response.data.data;
             setEmployee(empData);
             
             // Initialize form fields
             setAddress(empData.profile?.address || '');
             setPhone(empData.profile?.phone || '');
             setProfilePicture(empData.profile?.profilePicture || '');
             setEmail(empData.email || '');
           } else {
             setError('Employee profile not found.');
           }
        */

      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve profile information.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  // Adjust active tab state if user role updates and restricts view
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab('Private Info');
    }
  }, [currentUser]);

  // 2. Save Private Info Form Updates
  const handleUpdatePrivateInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      /* ==========================================
         CORE LOGIC FOR UPDATING PRIVATE PROFILE INFO
         ==========================================
         TODO: Implement the API PUT request here.
         Example implementation:
         
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const response = await axios.put(
           `${API_BASE_URL}/users/profile/${id}`,
           {
             profile: { address, phone, profilePicture }
           },
           { withCredentials: true }
         );

         if (response.data.success) {
           setSuccessMessage('Private information updated successfully!');
           setEmployee(response.data.data);
           if (onProfileUpdated) {
             onProfileUpdated(response.data.data);
           }
         }
      */

    } catch (err) {
      console.error('Error saving private profile details:', err);
      setError(err.response?.data?.message || 'Failed to update private profile details.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Save Security Credentials Updates
  const handleUpdateSecurityInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      /* ==========================================
         CORE LOGIC FOR UPDATING SECURITY CREDENTIALS
         ==========================================
         TODO: Implement the API PUT request here.
         Example implementation:
         
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const payload = { email };
         if (password.trim() !== '') {
           payload.password = password;
         }

         const response = await axios.put(
           `${API_BASE_URL}/users/profile/${id}`,
           payload,
           { withCredentials: true }
         );

         if (response.data.success) {
           setSuccessMessage('Security credentials updated successfully!');
           setPassword(''); // Clear input after successful save
           setEmployee(response.data.data);
           if (onProfileUpdated) {
             onProfileUpdated(response.data.data);
           }
         }
      */

    } catch (err) {
      console.error('Error saving security settings:', err);
      setError(err.response?.data?.message || 'Failed to update security credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div 
            style={{ borderTopColor: '#875A7B' }}
            className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 mx-auto"
          ></div>
          <p className="mt-4 text-slate-600 font-semibold">Loading Profile Details...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center font-sans p-6">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm max-w-sm w-full">
          <p className="text-rose-600 font-bold text-lg mb-2">Error Loading Profile</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            style={{ backgroundColor: '#875A7B' }}
            className="text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md cursor-pointer"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const profileData = employee?.profile || {};
  const initials = `${profileData.firstName?.charAt(0) || ''}${profileData.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9F9FB] p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Back */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </button>

        {/* Profile Card Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt={profileData.firstName} 
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-sm"
              />
            ) : (
              <div 
                style={{ backgroundColor: '#875A7B' }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner border-4 border-purple-100/50"
              >
                {initials || 'EE'}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-sm font-bold text-[#875A7B] mt-1">{employee?.role || 'Employee'}</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                ID: {employee?.loginId || employee?._id}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {employee?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Tab System Navigation */}
        <div className="border-b border-slate-200 mb-8">
          <nav className="flex gap-6 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  borderBottomColor: activeTab === tab ? '#875A7B' : 'transparent',
                  color: activeTab === tab ? '#875A7B' : '#64748B'
                }}
                className={`py-3 px-1 text-sm font-bold border-b-2 hover:text-slate-800 transition-all cursor-pointer whitespace-nowrap`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div>
          
          {/* Resume Tab */}
          {activeTab === 'Resume' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-700">Resume & Experience History</h3>
              <p className="text-xs text-slate-500 mt-1">Timeline components, achievements, and document attachments reside here.</p>
            </div>
          )}

          {/* Private Info Tab Form */}
          {activeTab === 'Private Info' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-base font-bold text-slate-800">Private Information</h2>
                <p className="text-xs text-slate-500 mt-1">Manage private contact details, address, and profile picture settings.</p>
              </div>

              <form onSubmit={handleUpdatePrivateInfo} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-semibold"
                      placeholder="e.g. +91 99999 99999"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Profile Picture URL</label>
                    <input
                      type="text"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-medium"
                      placeholder="Enter profile picture URL link..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Home Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-medium h-24 resize-none"
                      placeholder="Enter residential address details..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                    {successMessage}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: '#875A7B' }}
                    className="text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving Updates...' : 'Save Private Info'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Salary Info Tab Component (Role-based access controlled) */}
          {activeTab === 'Salary Info' && isStaff && (
            <SalaryInfoTab
              employee={employee}
              currentUser={currentUser}
              onUpdateSuccess={(updatedEmp) => {
                setEmployee(updatedEmp);
                if (onProfileUpdated) {
                  onProfileUpdated(updatedEmp);
                }
              }}
            />
          )}

          {/* Security Tab Form */}
          {activeTab === 'Security' && isStaff && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-base font-bold text-slate-800">Security & Credentials</h2>
                <p className="text-xs text-slate-500 mt-1">Manage system password parameters and credentials.</p>
              </div>

              <form onSubmit={handleUpdateSecurityInfo} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Login Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">New Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg text-sm p-2.5 focus:outline-none focus:border-purple-600 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                    {successMessage}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: '#875A7B' }}
                    className="text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving Credentials...' : 'Save Security Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
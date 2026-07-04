import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../axios_api/axios';
import SalaryInfoTab from './SalaryInfoTab';

const EmployeeProfile = ({ currentUser, onProfileUpdated }) => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get(`/create/${id}`);
        if (response.data.success) {
          const empData = response.data.data;
          setEmployee(empData);
          
          setAddress(empData.profile?.address || '');
          setPhone(empData.profile?.phone || '');
          setProfilePicture(empData.profile?.profilePicture || '');
          setEmail(empData.email || '');
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve profile information.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployeeDetails();
  }, [id]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab('Private Info');
  }, [currentUser]);

  const handleUpdatePrivateInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await api.put(`/create/${id}`, {
        profile: { address, phone, profilePicture }
      });

      if (response.data.success) {
        setSuccessMessage('Private information updated successfully!');
        setEmployee(response.data.data);
        if (onProfileUpdated) onProfileUpdated(response.data.data);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving private profile details:', err);
      setError(err.response?.data?.message || 'Failed to update private profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurityInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const payload = { email };
      if (password.trim() !== '') {
        payload.password = password;
      }

      const response = await api.put(`/create/${id}`, payload);

      if (response.data.success) {
        setSuccessMessage('Security credentials updated successfully!');
        setPassword('');
        setEmployee(response.data.data);
        if (onProfileUpdated) onProfileUpdated(response.data.data);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError(err.response?.data?.message || 'Failed to update security credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f1f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-[#714B67]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-[#9C8195]">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-[#f4f1f3] flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white border border-[#F1EDF0] rounded-xl shadow-sm max-w-sm w-full">
          <p className="text-[#991B1B] font-bold text-lg mb-2">Error Loading Profile</p>
          <p className="text-sm text-[#9C8195] mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="text-white bg-[#714B67] hover:bg-[#4F3548] px-4 py-2 rounded-md text-sm font-semibold transition-colors"
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
    <div className="min-h-screen bg-[#f4f1f3] py-10 px-6 sm:px-10 text-[#392634]">
      <div className="max-w-5xl mx-auto">
        
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#9C8195] hover:text-[#714B67] text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-[#F1EDF0] shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt={profileData.firstName} 
                className="w-24 h-24 rounded-full object-cover border border-[#F1EDF0]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#EAE5E9] flex items-center justify-center text-[#714B67] text-2xl font-bold">
                {initials || 'EE'}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-[#392634]">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-sm font-semibold text-[#9C8195] mt-0.5">{employee?.role || 'Employee'}</p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-[#585D68]">
              <span className="flex items-center gap-1.5 bg-[#F9F9FB] px-2 py-1 rounded-md border border-[#F1EDF0]">
                <svg className="w-4 h-4 text-[#9C8195]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {employee?.loginId || employee?._id}
              </span>
              <span className="flex items-center gap-1.5 bg-[#F9F9FB] px-2 py-1 rounded-md border border-[#F1EDF0]">
                <svg className="w-4 h-4 text-[#9C8195]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {employee?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#F1EDF0] mb-6">
          <nav className="flex gap-6 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setSuccessMessage('');
                }}
                className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-[#714B67] text-[#714B67]' 
                    : 'border-transparent text-[#9C8195] hover:text-[#392634]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          
          {activeTab === 'Resume' && (
            <div className="bg-white p-8 rounded-xl border border-[#F1EDF0] shadow-sm text-center">
              <svg className="h-12 w-12 text-[#EAE5E9] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-[#392634]">Resume & Experience</h3>
              <p className="text-xs text-[#9C8195] mt-1">This section is currently under construction.</p>
            </div>
          )}

          {activeTab === 'Private Info' && (
            <div className="bg-white rounded-xl border border-[#F1EDF0] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F1EDF0] bg-[#FDFCFD]">
                <h2 className="text-sm font-semibold text-[#392634]">Private Information</h2>
              </div>
              <form onSubmit={handleUpdatePrivateInfo} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] bg-[#FDFCFD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Profile Picture URL</label>
                    <input
                      type="text"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] bg-[#FDFCFD]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Home Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] bg-[#FDFCFD] h-20 resize-none"
                    />
                  </div>
                </div>

                {error && <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] rounded-md text-sm">{error}</div>}
                {successMessage && <div className="p-3 bg-[#E9F8F5] border border-[#A7F3D0] text-[#115C4D] rounded-md text-sm">{successMessage}</div>}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#714B67] hover:bg-[#4F3548] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Salary Info' && isStaff && (
            <SalaryInfoTab
              employee={employee}
              currentUser={currentUser}
              onUpdateSuccess={(updatedEmp) => {
                setEmployee(updatedEmp);
                if (onProfileUpdated) onProfileUpdated(updatedEmp);
              }}
            />
          )}

          {activeTab === 'Security' && isStaff && (
            <div className="bg-white rounded-xl border border-[#F1EDF0] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F1EDF0] bg-[#FDFCFD]">
                <h2 className="text-sm font-semibold text-[#392634]">Security Settings</h2>
              </div>
              <form onSubmit={handleUpdateSecurityInfo} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">Login Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] bg-[#FDFCFD]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9C8195] uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full border border-[#F1EDF0] rounded-md text-sm p-2.5 focus:outline-none focus:border-[#714B67] bg-[#FDFCFD]"
                    />
                  </div>
                </div>

                {error && <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] rounded-md text-sm">{error}</div>}
                {successMessage && <div className="p-3 bg-[#E9F8F5] border border-[#A7F3D0] text-[#115C4D] rounded-md text-sm">{successMessage}</div>}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#714B67] hover:bg-[#4F3548] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Credentials'}
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios_api/axios';
import EmployeeCard from './EmployeeCard';
import EmployeeAttendanceTable from './EmployeeAttendanceTable';
import TimeOffModal from './TimeOffModal';
import { useAuth } from '../context/authContext';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  // Production Setup: Initialize state as empty/null, completely independent of local mock data
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'attendance'
  const [isTimeOffOpen, setIsTimeOffOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState('');
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Retrieve user identity from storage (JWT is stored in an HttpOnly secure cookie)
  const loggedInUserId = authUser?.id;

  // Base API URL config
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Synchronize employee attendance state updates locally after successful check-in/out
  const updateStatusInState = (newStatus) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => {
        if (emp._id === currentUser?._id) {
          return { ...emp, status: newStatus };
        }
        return emp;
      })
    );
    setCurrentUser(prev => (prev ? { ...prev, status: newStatus } : null));
  };

  // Fetch employee directory list on mount / render only
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all employees from the directory
        const response = await api.get('/create');
        
        const employeeList = response.data || [];
        setEmployees(employeeList);

        const activeUser = employeeList.find(emp => emp._id === loggedInUserId) || null;
        setCurrentUser(activeUser);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [loggedInUserId]);

  // 1. Handle Check-in Action with simulated latency and alerts
  const handleCheckIn = async () => {
    if (!currentUser) return;
    
    try {
      setCheckInLoading(true);
      setError('');
      setCheckInSuccess('');

      // Simulating a 1-second network latency delay before contacting backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await api.post(
        '/api/attendance/check-in',
        {}
      );

      if (response.data.success) {
        const checkInData = response.data.data;
        alert(`[Backend API] Check-in successful at ${checkInData.checkInTime}!`);
        setCheckInSuccess(`Successfully checked in at ${checkInData.checkInTime}!`);
        updateStatusInState('Present');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // 2. Handle Check-out Action with simulated latency and alerts
  const handleCheckOut = async () => {
    if (!currentUser) return;

    try {
      setCheckInLoading(true);
      setError('');
      setCheckInSuccess('');

      // Simulating a 1-second network latency delay before contacting backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await api.patch(
        '/api/attendance/check-out',
        {}
      );

      if (response.data.success) {
        alert('[Backend API] Checked out successfully!');
        setCheckInSuccess('Successfully checked out!');
        updateStatusInState('Absent'); // Reverts indicator dot to yellow (Absent)
      }
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err.response?.data?.message || 'Check-out failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // 3. Handle Search Bar Input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Header Avatar Render (Displays profile photo, falls back to initials if none)
  const renderHeaderAvatar = () => {
    if (!currentUser) return null;
    const avatarUrl = currentUser.profile?.avatar || currentUser.profile?.profilePicture;
    const initials = `${currentUser.profile?.firstName?.charAt(0)}${currentUser.profile?.lastName?.charAt(0)}`.toUpperCase();

    if (avatarUrl && avatarUrl !== 'https://unsplash.com') {
      return (
        <img 
          src={avatarUrl} 
          alt={currentUser.profile?.firstName} 
          className="h-10 w-10 rounded-lg object-cover border border-purple-200/50 shadow-sm"
        />
      );
    }

    return (
      <div 
        style={{ backgroundColor: '#875A7B' }}
        className="h-10 w-10 text-white font-bold rounded-lg flex items-center justify-center text-sm shadow-inner"
      >
        {initials}
      </div>
    );
  };

  // Header status indicator - Retaining ONLY visual symbols (no text labels)
  const renderHeaderStatusIndicator = () => {
    if (!currentUser) return null;
    switch (currentUser.status) {
      case 'Present':
        return (
          <span className="flex h-2.5 w-2.5 relative" title="Present">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        );
      case 'Leave':
        return (
          <span className="text-purple-600 inline-block" title="On Leave">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"/>
            </svg>
          </span>
        );
      case 'Absent':
      default:
        return (
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" title="Absent"></span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            style={{ borderTopColor: '#875A7B' }}
            className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 mx-auto"
          ></div>
          <p className="mt-4 text-slate-600 font-semibold">Loading HRMS Dashboard...</p>
        </div>
      </div>
    );
  }

  // If the dashboard does not receive any data or receives null (empty), do not render the dashboard and instead in middle mention NO EMPLOYEES
  if (!employees || employees.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center font-sans p-6">
        <div className="text-center p-8 bg-white border-2 border-purple-100 rounded-xl shadow-sm max-w-sm w-full">
          <p className="text-[#875A7B] font-black text-xl tracking-wider uppercase">No Employees</p>
        </div>
      </div>
    );
  }

   // 3. Filter employees based on search query text (searches firstName, lastName, and loginId)
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const firstName = emp.profile?.firstName?.toLowerCase() || '';
    const lastName = emp.profile?.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const loginId = emp.loginId?.toLowerCase() || '';
    
    return firstName.includes(query) || 
           lastName.includes(query) || 
           fullName.includes(query) || 
           loginId.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-700 uppercase tracking-wider">Dashboard</h1>
          </div>
          
          {/* Account and Attendance Controls */}
          {currentUser && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border-2 border-purple-100/50 shadow-sm">
              <div className="flex items-center gap-3">
                {renderHeaderAvatar()}
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {currentUser.profile?.firstName} {currentUser.profile?.lastName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentUser.role}</p>
                </div>
              </div>

              {/* Attendance Actions Badge */}
              <div className="border-l border-slate-200 pl-4 pr-1 flex items-center gap-3">
                {renderHeaderStatusIndicator()}
                
                {currentUser.status === 'Present' ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={checkInLoading}
                    style={{ border: '1px solid #875A7B', color: '#875A7B' }}
                    onMouseOver={(e) => { e.target.style.backgroundColor = '#F9F6F8'; }}
                    onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                    className="inline-flex items-center bg-transparent px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {checkInLoading ? 'Checking Out...' : 'Check Out'}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkInLoading}
                    style={{ backgroundColor: '#875A7B' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#714B67'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#875A7B'}
                    className="inline-flex items-center text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Check In
                  </button>
                )}

                {/* Time Off button */}
                <button
                  onClick={() => setIsTimeOffOpen(true)}
                  style={{ border: '1px solid #875A7B', color: '#875A7B' }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = '#F9F6F8'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                  className="inline-flex items-center bg-transparent px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Time Off
                </button>

                {/* Logout Button */}
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="inline-flex items-center bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {checkInSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {checkInSuccess}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 flex gap-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'border-[#875A7B] text-[#875A7B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Directory
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-[#875A7B] text-[#875A7B]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Attendance
          </button>
        </div>

        {activeTab === 'directory' && (
          <>
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search employees..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Employee Grid */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">Team Directory</h2>
                <span className="bg-slate-200/80 text-slate-700 text-xs px-2.5 py-1 rounded-md font-bold">
                  Total: {employees.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {employees.filter(emp => 
                  `${emp.profile?.firstName} ${emp.profile?.lastName}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).map(emp => (
                  <div 
                    key={emp._id}
                    onClick={() => navigate(`/profile/${emp._id}`)}
                    className="cursor-pointer transition-transform hover:-translate-y-1 active:scale-98"
                  >
                    <EmployeeCard employee={emp} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'attendance' && (
          <EmployeeAttendanceTable />
        )}

        {/* Time Off Modal */}
        <TimeOffModal isOpen={isTimeOffOpen} onClose={() => setIsTimeOffOpen(false)} />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
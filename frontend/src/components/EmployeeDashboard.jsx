import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeCard from '../../components/EmployeeCard';

// Configure Axios globally to automatically attach cookies (like HttpOnly secure cookies)
// to all outgoing cross-origin requests.
axios.defaults.withCredentials = true;

const EmployeeDashboard = () => {
  // Production Setup: Initialize state as empty/null, completely independent of local mock data
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState('');
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Retrieve user identity from storage (JWT is stored in an HttpOnly secure cookie)
  const loggedInUserId = localStorage.getItem('userId');

  // Base API URL config
  const API_BASE_URL = 'http://localhost:5000/api';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch team directory list from backend.
        // NOTE: The token is contained in an HttpOnly cookie, which is sent automatically.
        const response = await axios.get(`${API_BASE_URL}/users`, {
          withCredentials: true
        });
        
        const employeeList = response.data.data || response.data || [];
        setEmployees(employeeList);

        /*
          AUTHENTICATING CURRENT LOGGED IN USER:
          Identify the logged-in user inside the directory pool using the local userId lookup.
          In production, you can alternatively fetch this details via a dedicated '/api/users/me' route.
        */
        const activeUser = employeeList.find(emp => emp._id === loggedInUserId) || employeeList[0];
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

      const response = await axios.post(
        `${API_BASE_URL}/attendance/check-in`,
        {},
        { withCredentials: true }
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

      const response = await axios.post(
        `${API_BASE_URL}/attendance/check-out`,
        {},
        { withCredentials: true }
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

  // 3. Handle Search Bar Input (Typable & Accessible)
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    /*
      FUTURE INTERACTIVE FILTERING DEVELOPMENT:
      To fully connect filtering logic inside the directory view:
      
      1. Maintain a master record list (e.g. `const [masterEmployees, setMasterEmployees] = useState(data)`)
      2. Filter items matching query criteria:
         
         const queryText = e.target.value.toLowerCase();
         const filteredResults = masterEmployees.filter(emp => 
           emp.profile?.firstName?.toLowerCase().includes(queryText) ||
           emp.profile?.lastName?.toLowerCase().includes(queryText) ||
           emp.loginId?.toLowerCase().includes(queryText) ||
           emp.role?.toLowerCase().includes(queryText)
         );
         setEmployees(filteredResults);
    */
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
          <p className="text-[#875A7B] font-black text-xl tracking-wider">NO EMPLOYEES</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header - Simplified to a simple dashboard header in smaller text */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-700 uppercase tracking-wider">Dashboard</h1>
          </div>
          
          {/* Quick Check-in/out Actions & Account controls for Current Logged-in Employee */}
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

              {/* Attendance Actions Badge (ONLY visual indicator symbols rendered) */}
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

                {/* Logout Button (Same design as Check-in/out, styled in Red, placed next to them) */}
                <button
                  onClick={async () => {
                    try {
                      // Call backend logout route if cookie needs server clearance
                      await axios.post(`${API_BASE_URL}/users/logout`, {}, { withCredentials: true });
                    } catch (err) {
                      console.warn('Backend offline or logout endpoint unconfigured, clearing user local state');
                    }
                    localStorage.removeItem('userId');
                    alert('[Skeleton Action] Logging out employee and clearing secure sessions...');
                  }}
                  className="inline-flex items-center bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Message Banner for Success or Errors */}
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

        {/* Search & Actions Bar (Odoo Style - Swapped: New button on left, Search on right) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
          
          {/* New Button (Left side) */}
          <button
            onClick={() => {
              /*
                TODO: In future updates, clicking this button will open the Admin/HR employee registration modal.
                e.g., setIsCreateModalOpen(true);
              */
              alert('[Skeleton Action] Create/Add New Employee modal will open here.');
            }}
            style={{ backgroundColor: '#875A7B' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#714B67'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#875A7B'}
            className="flex items-center justify-center gap-1.5 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>

          {/* Search Bar - Typable and Accessible */}
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
            {employees.map(emp => (
              <EmployeeCard key={emp._id} employee={emp} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
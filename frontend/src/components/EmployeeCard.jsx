import React from 'react';

const EmployeeCard = ({ employee }) => {
  const { profile = {}, role, loginId, status } = employee;
  const firstName = profile.firstName || 'Employee';
  const lastName = profile.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const avatarUrl = profile.avatar || profile.profilePicture;

  // Generate initials for placeholder avatar
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();



  // Determine status indicator mapping: Retaining ONLY symbols (no text labels)
  const renderStatusIndicator = () => {
    switch (status) {
      case 'Present':
        return (
          <div className="flex items-center justify-center p-1.5 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm" title="Present">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        );
      case 'Leave':
        return (
          <div className="flex items-center justify-center p-1 bg-purple-50 rounded-full border border-purple-200 shadow-sm" title="On Leave">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"/>
            </svg>
          </div>
        );
      case 'Absent':
      default:
        return (
          <div className="flex items-center justify-center p-1.5 bg-amber-50 rounded-full border border-amber-200 shadow-sm" title="Absent">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          </div>
        );
    }
  };

  return (
    <div 
      className="relative overflow-hidden bg-white border border-[#F1EDF0] hover:border-[#714B67] rounded-xl p-5 shadow-sm hover:opacity-90 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
    >
      {/* Top right status indicator (ONLY visual symbol) */}
      <div className="absolute top-3 right-3">
        {renderStatusIndicator()}
      </div>

      {/* Profile Picture / Initials (Small-Medium w-14 h-14 circle) */}
      <div className="mt-4 mb-4 relative">
        {avatarUrl && avatarUrl !== 'https://unsplash.com' ? (
          <img 
            src={avatarUrl} 
            alt={fullName} 
            className="w-14 h-14 rounded-full object-cover border border-purple-100 shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
            }}
          />
        ) : (
          <div 
            style={{ backgroundColor: '#875A7B' }}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold shadow-inner border border-purple-100/50"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Employee Metadata */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight leading-tight">{fullName}</h3>
      <p className="text-xs font-semibold text-slate-500 mt-1">{role || 'Employee'}</p>
      
      <div className="mt-4 w-full border-t border-slate-100 pt-3">
        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Login ID</span>
        <p className="text-xs font-mono font-bold text-slate-600 mt-0.5 bg-slate-50 py-0.5 px-2 rounded border border-slate-100 inline-block">
          {loginId || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default EmployeeCard;
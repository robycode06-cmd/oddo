import React, { useState, useEffect } from 'react';
import api from '../../axios_api/axios';

const AdminLeaveTable = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/api/leave/all');
      setLeaveData(response.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/leave/status/${id}`, { status: newStatus });
      setLeaveData(prevData => 
        prevData.map(req => 
          req._id === id ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const statusConfig = {
    Approved: { bg: 'bg-[#E9F8F5]', text: 'text-[#115C4D]', dot: 'bg-[#21B799]' },
    Pending:  { bg: 'bg-[#FCF6E6]', text: 'text-[#725500]', dot: 'bg-[#E4A900]' },
    Rejected: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', dot: 'bg-[#EF4444]' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f1f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-[#714B67]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-[#9C8195] font-medium">Loading requests…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1f3] py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#392634]">Time Off Requests</h1>
          <p className="text-[#9C8195] mt-1">Review and manage all employee leave requests</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(113,75,103,0.08)] overflow-hidden">

          {/* Card Header */}
          <div className="px-8 py-5 border-b border-[#F1EDF0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-semibold text-[#392634]">All Requests</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#F1EDF0] text-xs font-bold text-[#714B67]">
                {leaveData.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1EDF0] bg-[#FDFCFD]">
                <th className="pl-8 pr-4 py-3.5 text-left text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">Employee</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">From</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">To</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">Type</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">Status</th>
                <th className="pl-4 pr-8 py-3.5 text-right text-[11px] font-semibold text-[#9C8195] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveData.map((request) => {
                const status = statusConfig[request.status] || statusConfig.Pending;
                return (
                  <tr
                    key={request._id}
                    className="border-b border-[#F1EDF0] last:border-0 hover:bg-[#faf8f9] transition-colors group"
                  >
                    <td className="pl-8 pr-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#714B67] to-[#9C8195] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {request.employeeRef?.profile?.firstName?.[0] || '?'}{request.employeeRef?.profile?.lastName?.[0] || ''}
                        </div>
                        <span className="text-sm font-medium text-[#392634]">
                          {request.employeeRef?.profile?.firstName} {request.employeeRef?.profile?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#585D68]">{formatDate(request.startDate)}</td>
                    <td className="px-4 py-4 text-sm text-[#585D68]">{formatDate(request.endDate)}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#714B67]">{request.leaveType}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {request.status}
                      </span>
                    </td>
                    <td className="pl-4 pr-8 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'Approved')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#115C4D] bg-[#E9F8F5] rounded-md hover:bg-[#21B799] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-[#E9F8F5] disabled:hover:text-[#115C4D] transition-all"
                          disabled={request.status !== 'Pending'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] rounded-md hover:bg-[#EF4444] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-[#FEF2F2] disabled:hover:text-[#991B1B] transition-all"
                          disabled={request.status !== 'Pending'}
                        >
                          Reject
                        </button>
                        {request.attachmentUrl && (
                          <a
                            href={`http://localhost:8000/${request.attachmentUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-xs font-semibold text-[#017E84] bg-[#E6F2F3] rounded-md hover:bg-[#017E84] hover:text-white transition-all"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {leaveData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-[#F1EDF0] flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#C6B7C2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#392634]">No requests yet</p>
                      <p className="text-xs text-[#C6B7C2]">Requests will appear here once submitted.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveTable;
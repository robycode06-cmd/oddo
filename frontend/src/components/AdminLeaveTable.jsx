import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminLeaveTable = ({ token }) => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/leave/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveData(response.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/api/leave/status/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    Approved: {
      bg: 'bg-[#E9F8F5]',
      text: 'text-[#115C4D]',
      dot: 'bg-[#21B799]',
    },
    Pending: {
      bg: 'bg-[#FCF6E6]',
      text: 'text-[#725500]',
      dot: 'bg-[#E4A900]',
    },
    Rejected: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#991B1B]',
      dot: 'bg-[#EF4444]',
    },
  };

  // Loading
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center gap-4 shadow-sm shadow-[#714B67]/5">
        <svg className="animate-spin w-8 h-8 text-[#714B67]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-[#9C8195] font-medium">Loading requests…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-[#714B67]/5 overflow-hidden">

      {/* Table Header Bar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-[#F1EDF0]">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-[#392634]">All Requests</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#F1EDF0] text-xs font-bold text-[#714B67]">
            {leaveData.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1EDF0]">
              <th className="px-8 py-4 text-left text-xs font-semibold text-[#9C8195] uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9C8195] uppercase tracking-wider">Start</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9C8195] uppercase tracking-wider">End</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9C8195] uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9C8195] uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 text-right text-xs font-semibold text-[#9C8195] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveData.map((request, index) => {
              const status = statusConfig[request.status] || statusConfig.Pending;
              return (
                <tr
                  key={request._id}
                  className={`border-b border-[#F1EDF0] last:border-b-0 hover:bg-[#F9F7F8] transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FDFCFD]'
                  }`}
                >
                  {/* Employee */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#714B67] to-[#9C8195] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {request.employeeRef?.profile?.firstName?.[0] || '?'}{request.employeeRef?.profile?.lastName?.[0] || ''}
                      </div>
                      <span className="text-sm font-semibold text-[#392634]">
                        {request.employeeRef?.profile?.firstName} {request.employeeRef?.profile?.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-5 text-sm text-[#585D68]">{formatDate(request.startDate)}</td>
                  <td className="px-6 py-5 text-sm text-[#585D68]">{formatDate(request.endDate)}</td>

                  {/* Type */}
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-[#714B67]">
                      {request.leaveType}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {request.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateStatus(request._id, 'Approved')}
                        className="px-3.5 py-2 text-xs font-semibold text-[#115C4D] bg-[#E9F8F5] rounded-lg hover:bg-[#21B799] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#E9F8F5] disabled:hover:text-[#115C4D] transition-all"
                        disabled={request.status !== 'Pending'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                        className="px-3.5 py-2 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] rounded-lg hover:bg-[#EF4444] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#FEF2F2] disabled:hover:text-[#991B1B] transition-all"
                        disabled={request.status !== 'Pending'}
                      >
                        Reject
                      </button>
                      {request.attachmentUrl && (
                        <a
                          href={`http://localhost:8000/${request.attachmentUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 text-xs font-semibold text-[#017E84] bg-[#E6F2F3] rounded-lg hover:bg-[#017E84] hover:text-white transition-all"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {leaveData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#F1EDF0] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#C6B7C2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#392634]">No requests yet</p>
                      <p className="text-xs text-[#C6B7C2] mt-1">Requests will appear here once submitted.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeaveTable;
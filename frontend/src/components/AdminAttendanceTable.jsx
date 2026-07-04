import React, { useState, useEffect } from 'react';
import api from '../../axios_api/axios';
import { calculateHours } from '../utils/timeCalculator';

const AdminAttendanceTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]); // Re-fetch whenever the date changes

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/attendance/all?date=${selectedDate}`);
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching admin attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#F1EDF0] rounded-2xl shadow-[0_1px_3px_rgba(113,75,103,0.08)] overflow-hidden">
      <div className="px-6 py-5 flex justify-between items-center border-b border-[#F1EDF0]">
        <h2 className="text-base font-bold text-gray-800">Daily Attendance Log</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9C8194]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg className="animate-spin h-6 w-6 text-[#714B67]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-[#9C8195]">Loading records...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FDFCFD] border-b border-[#F1EDF0]">
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Check In</th>
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Check Out</th>
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Work Hours</th>
                <th className="py-3.5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Extra Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const { workHours, extraHours } = calculateHours(record.checkInTime, record.checkOutTime);
                return (
                  <tr key={record._id} className="border-b border-[#F1EDF0] last:border-0 hover:bg-[#faf8f9] transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {record.employeeRef?.profile?.firstName} {record.employeeRef?.profile?.lastName}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        record.status === 'Present' ? 'bg-green-50 text-green-600' : 
                        record.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-[#F4EFF2] text-[#714B67]'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{record.checkInTime || '--:--'}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{record.checkOutTime || '--:--'}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{workHours}</td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-green-600">{extraHours !== '-' && extraHours !== '00:00' ? `+${extraHours}` : '-'}</td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <p className="text-sm font-medium text-gray-800">No attendance records found</p>
                    <p className="text-xs text-gray-400 mt-1">No check-ins logged for {selectedDate}.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceTable;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateHours } from '../../../utils/timeCalculator';

const AdminAttendanceTable = ({ token }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]); // Re-fetch whenever the date changes

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/attendance/all?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching admin attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow p-4 text-gray-300">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
        <h2 className="text-lg font-semibold text-white">Daily Attendance Log</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm">Select Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading records...</div>
      ) : (
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2c2c2c] border-b border-gray-600">
            <tr>
              <th className="p-3 font-semibold text-blue-400">Employee</th>
              <th className="p-3 font-semibold text-blue-400">Status</th>
              <th className="p-3 font-semibold text-blue-400">Check In</th>
              <th className="p-3 font-semibold text-blue-400">Check Out</th>
              <th className="p-3 font-semibold text-blue-400">Work Hours</th>
              <th className="p-3 font-semibold text-blue-400">Extra Hours</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const { workHours, extraHours } = calculateHours(record.checkIn, record.checkOut);
              return (
                <tr key={record._id} className="border-b border-gray-700 hover:bg-[#252525]">
                  <td className="p-3">
                    {record.employeeRef?.profile?.firstName} {record.employeeRef?.profile?.lastName}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.status === 'Present' ? 'bg-green-900 text-green-300' : 
                      record.status === 'Absent' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3">{record.checkIn || '--:--'}</td>
                  <td className="p-3">{record.checkOut || '--:--'}</td>
                  <td className="p-3">{workHours}</td>
                  <td className="p-3 text-green-400">{extraHours !== '-' && extraHours !== '00:00' ? `+${extraHours}` : '-'}</td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No attendance records found for {selectedDate}.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAttendanceTable;
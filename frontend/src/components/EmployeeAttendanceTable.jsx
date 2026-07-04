import React, { useState, useEffect } from 'react';
import api from '../../axios_api/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { calculateHours } from '../utils/timeCalculator';

const EmployeeAttendanceTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Metrics State
  const [daysPresent, setDaysPresent] = useState(0);
  const [leavesCount, setLeavesCount] = useState(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        const response = await api.get('/api/attendance/me');
        
        const data = response.data.data || [];
        setRecords(data);
        
        // Calculate Metrics
        const present = data.filter(r => r.status === 'Present' || r.status === 'Half-day').length;
        const leaves = data.filter(r => r.status === 'Leave').length;
        
        setDaysPresent(present);
        setLeavesCount(leaves);
        setTotalWorkingDays(data.length);

      } catch (error) {
        console.error('Error fetching personal attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, []);

  // Function to inject status dots into the calendar days
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      // Safely format the JS Date to YYYY-MM-DD local time to match database records
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');
      
      const dayRecord = records.find(r => r.date === formattedDate);

      if (dayRecord) {
        if (dayRecord.status === 'Present') return <div className="w-2 h-2 mx-auto mt-1 bg-green-500 rounded-full"></div>;
        if (dayRecord.status === 'Absent') return <div className="w-2 h-2 mx-auto mt-1 bg-red-500 rounded-full"></div>;
        if (dayRecord.status === 'Leave') return <div className="w-2 h-2 mx-auto mt-1 bg-blue-500 rounded-full"></div>;
        if (dayRecord.status === 'Half-day') return <div className="w-2 h-2 mx-auto mt-1 bg-yellow-500 rounded-full"></div>;
      }
    }
    return null;
  };

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow p-4 text-gray-300">
      
      {/* Top Metrics Bar */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-4">
        <div className="bg-[#2c2c2c] px-4 py-2 rounded-lg text-center flex-1">
          <p className="text-xs text-gray-400">Total Working Days</p>
          <p className="text-xl font-bold text-white">{totalWorkingDays}</p>
        </div>
        <div className="bg-[#2c2c2c] px-4 py-2 rounded-lg text-center flex-1 border-l-4 border-green-500">
          <p className="text-xs text-gray-400">Count of Days Present</p>
          <p className="text-xl font-bold text-green-400">{daysPresent}</p>
        </div>
        <div className="bg-[#2c2c2c] px-4 py-2 rounded-lg text-center flex-1 border-l-4 border-blue-500">
          <p className="text-xs text-gray-400">Leaves Count</p>
          <p className="text-xl font-bold text-blue-400">{leavesCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-400">Loading your history...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual Calendar Section */}
          <div className="lg:col-span-1 flex flex-col items-center p-4 bg-white rounded-lg text-black">
            <h3 className="w-full text-left font-bold mb-3 text-gray-800">Monthly View</h3>
            {/* Custom Tailwind override classes can be applied to the calendar wrapper if needed */}
            <div className="w-full overflow-hidden [&_.react-calendar]:border-none [&_.react-calendar]:w-full">
              <Calendar 
                onChange={setCalendarDate} 
                value={calendarDate}
                tileContent={tileContent}
              />
            </div>
            <div className="flex justify-between w-full mt-4 text-xs text-gray-600 px-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Present</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Leave</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Absent</span>
            </div>
          </div>

          {/* Detailed Table Section */}
          <div className="lg:col-span-2 overflow-x-auto border border-gray-700 rounded-lg">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#2c2c2c] border-b border-gray-600">
                <tr>
                  <th className="p-3 font-semibold text-blue-400">Date</th>
                  <th className="p-3 font-semibold text-blue-400">Status</th>
                  <th className="p-3 font-semibold text-blue-400">Check In</th>
                  <th className="p-3 font-semibold text-blue-400">Check Out</th>
                  <th className="p-3 font-semibold text-blue-400">Work Hours</th>
                  <th className="p-3 font-semibold text-blue-400">Extra Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const { workHours, extraHours } = calculateHours(record.checkInTime, record.checkOutTime);
                  return (
                    <tr key={record._id} className="border-b border-gray-700 hover:bg-[#252525]">
                      <td className="p-3">{record.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'Present' ? 'bg-green-900 text-green-300' : 
                          record.status === 'Leave' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3">{record.checkInTime || '--:--'}</td>
                      <td className="p-3">{record.checkOutTime || '--:--'}</td>
                      <td className="p-3">{workHours}</td>
                      <td className="p-3 text-green-400">{extraHours !== '-' && extraHours !== '00:00' ? `+${extraHours}` : '-'}</td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No attendance history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceTable;
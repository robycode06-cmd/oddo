const Attendance = require('../model/Attendance');

/**
 * Utility function to get the current date in local YYYY-MM-DD format.
 * en-CA naturally outputs YYYY-MM-DD.
 */
const getLocalDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata' // Forces Kolkata timezone globally
  }).format(new Date());
};

/**
 * Utility function to get the current local time in HH:MM:SS format (24-hour).
 */
const getLocalTimeString = () => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata' // Forces Kolkata timezone globally
  }).format(new Date());
};

/**
 * POST /api/attendance/check-in
 * Finds today's attendance record for the logged-in user and updates check-in details.
 */
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const todayStr = getLocalDateString();
    const currentTimeStr = getLocalTimeString(); // Get time in HH:MM:SS format

    let attendance = await Attendance.findOne({
      employeeRef: employeeId,
      date: todayStr
    });

    if (attendance) {
      if (attendance.checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in for today',
          data: attendance
        });
      }

      // Save only the local time string
      attendance.checkInTime = currentTimeStr;
      attendance.status = 'Present';
      await attendance.save();
    } else {
      // Create a new record with check-in time
      attendance = new Attendance({
        employeeRef: employeeId,
        date: todayStr,
        checkInTime: currentTimeStr, // Save only the local time string
        status: 'Present'
      });
      await attendance.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during check-in',
      error: error.message
    });
  }
};

/**
 * POST /api/attendance/check-out
 * Finds today's attendance record for the logged-in user and updates check-out details.
 */
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const todayStr = getLocalDateString();
    const currentTimeStr = getLocalTimeString(); // Get time in HH:MM:SS format

    let attendance = await Attendance.findOne({
      employeeRef: employeeId,
      date: todayStr
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No attendance record found for today. Please check in first.'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out for today',
        data: attendance
      });
    }

    // Save only the local check-out time string
    attendance.checkOutTime = currentTimeStr;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during check-out',
      error: error.message
    });
  }
};
const Attendance = require('../models/Attendance');

/**
 * Utility function to get the current date in local YYYY-MM-DD format.
 */
const getLocalDateString = () => {
  return new Intl.DateTimeFormat('en-CA', { // en-CA naturally outputs YYYY-MM-DD
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(new Date());
};

/**
 * Utility function to get the current local time in HH:MM:SS format.
 */
const getLocalTimeString = () => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata' // 👈 Forces the correct timezone anywhere in the world
  }).format(new Date());
};

/**
 * POST /api/attendance/check-in
 */
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const todayStr = getLocalDateString();
    const currentTimeStr = getLocalTimeString(); // Get time only

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

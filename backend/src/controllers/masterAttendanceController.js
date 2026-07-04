import Attendance from "../models/Attendance.js";

// @route   GET /api/attendance/me
// @desc    Get logged-in employee's attendance history
// @access  Private

export const getMyAttendance =async (req, res) => {
    try {
        const records =await Attendance.find({employeeRef:req.user.id}).sort({date:-1});    // by newest first
        res.status(200).json({data:records});
    }catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance history.' });
    }

}

// @route   GET /api/attendance/all
// @desc    Get all employees' attendance for a specific date (Defaults to today)
// @access  Private/Admin

export const getAllAttendance =async (req,res) => {
    try {

        const dateQuery =req.query.date || new Date().toISOString().split('T')[0]  // YYYY-MM-DD format

        const records =await Attendance.find({date : dateQuery})
        .populate('employeeRef','profile.firstName profile.lastName loginId')
        .sort({checkIn:1});    // by earliest check-in first

        res.status(200).json({data:records});

    }catch (error) {
        res.status(500).json({ error: 'Failed to fetch company attendance.' });
    }
}

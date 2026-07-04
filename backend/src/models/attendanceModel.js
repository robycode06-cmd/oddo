const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-day', 'Leave'],
    default: 'Absent'
  },
  checkInTime: {
    type: String
  },
  checkOutTime: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to guarantee only one attendance record per employee per day
AttendanceSchema.index({ employeeRef: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
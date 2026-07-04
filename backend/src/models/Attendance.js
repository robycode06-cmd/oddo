import mongoose from 'mongoose';

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

AttendanceSchema.index({ employeeRef: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', AttendanceSchema);
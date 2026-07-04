import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EmployeeSchema = new mongoose.Schema({
  loginId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['Admin', 'HR', 'Employee'],
    default: 'Employee'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    profilePicture: {
      type: String,
      default: '',
      required: false
    }
  },
  salary: {
    base: {
      type: Number,
      default: 0
    },
    hra: {
      type: Number,
      default: 0
    },
    allowances: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
// Pre-save hook to hash password (using clean async/await without the next callback)
EmployeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(error);
  }
});

// Instance method to check password validity
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Employee =  mongoose.model('Employee', EmployeeSchema);

export default Employee;
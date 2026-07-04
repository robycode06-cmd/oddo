import Employee from '../models/Employee.js';
import crypto from 'crypto';


/**
 * Admin/HR route to register new employees
 */
export const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, role, address, phone, joiningYear, salary } = req.body;

    // 1. Validate mandatory fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        message: 'First name, last name, and email are required fields.' 
      });
    }

    // 2. Normalize and check if email is already registered
    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = await Employee.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({ 
        message: 'An employee with this email is already registered.' 
      });
    }

    // 3. ID Generation logic
    const cleanFirstName = firstName.trim().replace(/[^a-zA-Z]/g, '');
    const cleanLastName = lastName.trim().replace(/[^a-zA-Z]/g, '');

    const fPart = cleanFirstName.slice(0, 2).padEnd(2, 'X').toUpperCase();
    const lPart = cleanLastName.slice(0, 2).padEnd(2, 'X').toUpperCase();
    const year = joiningYear ? String(joiningYear) : String(new Date().getFullYear());
    const prefix = `${fPart}${lPart}${year}`;

    // Query database for the highest serial number matching prefix
    const lastEmployee = await Employee.findOne({
      loginId: { $regex: `^${prefix}` }
    }).sort({ loginId: -1 });

    let serial = 1;
    if (lastEmployee) {
      const serialStr = lastEmployee.loginId.substring(prefix.length);
      const parsedSerial = parseInt(serialStr, 10);
      if (!isNaN(parsedSerial)) {
        serial = parsedSerial + 1;
      }
    }

    const finalSerialStr = String(serial).padStart(4, '0');
    const loginId = `${prefix}${finalSerialStr}`;

    // 4. Auto-generate a temporary password
    const tempPassword = crypto.randomBytes(5).toString('hex'); 

    // 5. Create new Employee instance
    const newEmployee = new Employee({
      loginId,
      email: normalizedEmail,
      password: tempPassword, // Will be hashed automatically by Employee pre-save hook
      role: role || 'Employee',
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address || '',
        phone: phone || '',
        profilePicture: ''
      },
      salary: {
        base: salary?.base || 0,
        hra: salary?.hra || 0,
        allowances: salary?.allowances || 0
      }
    });

    await newEmployee.save();

    // 6. Respond with success & plaintext temporary credentials
    res.status(201).json({
      message: 'Employee account created successfully.',
      employee: {
        id: newEmployee._id,
        loginId: newEmployee.loginId,
        email: newEmployee.email,
        role: newEmployee.role,
        profile: newEmployee.profile,
        salary: newEmployee.salary,
        createdAt: newEmployee.createdAt
      },
      tempPassword
    });

  } catch (error) {
    console.error('Error in createEmployee:', error);
    res.status(500).json({ 
      message: 'Internal Server Error during user creation.', 
      error: error.message 
    });
  }
};

/**
 * Fetch all registered employees
 * GET /create
 */
export const getAllEmployees = async (req, res) => {
  try {
    const isStaff = req.user.role === 'Admin' || req.user.role === 'HR';
    const selectFields = isStaff ? '-password' : '-password -salary';
    
    const employees = await Employee.find({}).select(selectFields);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error retrieving employee records.' });
  }
};

/**
 * Delete an employee record
 * DELETE /create/:id
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent Admin/HR from deleting their own account
    if (req.user.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: 'Employee record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Internal server error during deletion.' });
  }
};

/**
 * Fetch a single employee by ID
 * GET /create/:id
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    res.status(500).json({ message: 'Error retrieving employee record.' });
  }
};

/**
 * Update an employee's profile, credentials, or salary
 * PUT /create/:id
 */
export const updateEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile, email, password, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Authorization: Only Admin/HR can update salary.
    // An employee can only update their own private info or security details.
    if (salary && req.user.role !== 'Admin' && req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Not authorized to update salary.' });
    }
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to update this profile.' });
    }

    // Update Profile Info
    if (profile) {
      if (profile.address !== undefined) employee.profile.address = profile.address;
      if (profile.phone !== undefined) employee.profile.phone = profile.phone;
      if (profile.profilePicture !== undefined) employee.profile.profilePicture = profile.profilePicture;
    }

    // Update Salary
    if (salary) {
      if (salary.base !== undefined) employee.salary.base = salary.base;
      if (salary.hra !== undefined) employee.salary.hra = salary.hra;
      if (salary.allowances !== undefined) employee.salary.allowances = salary.allowances;
    }

    // Update Security Credentials
    if (email) {
      const emailExists = await Employee.findOne({ email, _id: { $ne: id } });
      if (emailExists) return res.status(400).json({ message: 'Email is already in use.' });
      employee.email = email;
    }
    if (password && password.trim() !== '') {
      employee.password = password;
    }

    await employee.save();
    
    // Return updated employee without sensitive hash
    const updatedEmployee = await Employee.findById(id).select('-password');
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedEmployee });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Internal server error during update.' });
  }
};
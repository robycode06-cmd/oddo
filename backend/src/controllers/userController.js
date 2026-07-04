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
      tempPassword: tempPassword, // Saved in plaintext for Admin/HR visibility
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
    // Fetch all employees, selecting necessary fields (excluding passwords for safety)
    const employees = await Employee.find({}).select('-password');
    // Wrapped in a structured response format to fit the frontend dashboard response parser
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving employee records.' 
    });
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

export const getEmployeeById = async (req, res) => {
  try {
    const isStaff = req.user && (req.user.role === 'Admin' || req.user.role === 'HR');
    let query = Employee.findById(req.params.id).select('-password');
    if (!isStaff) {

      query = query.select('-salary');
    }
    const employee = await query;

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching employee details.',
      error: error.message
    });
  }
};
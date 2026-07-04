const Employee = require('../model/Employee');

/**
 * PUT /api/users/profile/:id
 * Allows updating basic profile details (Address, Phone).
 * Admin and HR can also update salary details (base, hra, allowances) and names/roles.
 */
exports.updateProfile = async (req, res) => {
  try {
    const targetId = req.params.id;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // 1. Authorization Check:
    // Standard employees are only allowed to update their own profile.
    // Admin/HR are allowed to update any employee profile.
    if (requestUserRole !== 'Admin' && requestUserRole !== 'HR' && requestUserId !== targetId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to modify this profile.'
      });
    }

    // 2. Find Employee Record
    const employee = await Employee.findById(targetId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found.'
      });
    }

    const { profile, salary, role } = req.body;

    // 3. Update Profile Object
    if (profile) {
      // Basic profile details updateable by any authorized user
      if (profile.address !== undefined) employee.profile.address = profile.address;
      if (profile.phone !== undefined) employee.profile.phone = profile.phone;
      if (profile.profilePicture !== undefined) employee.profile.profilePicture = profile.profilePicture;

      // Restricted profile details (First Name, Last Name) - can only be updated by Admin/HR
      if (requestUserRole === 'Admin' || requestUserRole === 'HR') {
        if (profile.firstName !== undefined) employee.profile.firstName = profile.firstName;
        if (profile.lastName !== undefined) employee.profile.lastName = profile.lastName;
      }
    }

    // 4. Update Salary Object (Permission already checked by route middleware, but validated here for safety)
    if (salary) {
      if (requestUserRole === 'Admin' || requestUserRole === 'HR') {
        if (salary.base !== undefined) employee.salary.base = Number(salary.base);
        if (salary.hra !== undefined) employee.salary.hra = Number(salary.hra);
        if (salary.allowances !== undefined) employee.salary.allowances = Number(salary.allowances);
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only Admin or HR roles can modify salary details.'
        });
      }
    }

    // 5. Update Restricted Core Properties (Role) - can only be updated by Admin/HR
    if (role !== undefined) {
      if (requestUserRole === 'Admin' || requestUserRole === 'HR') {
        employee.role = role;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only Admin or HR roles can modify employee roles.'
        });
      }
    }

    // 6. Save Updates to DB
    const updatedEmployee = await employee.save();

    // Do not return password hash
    const responseData = updatedEmployee.toObject();
    delete responseData.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during profile update.',
      error: error.message
    });
  }
};
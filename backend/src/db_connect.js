import mongoose from 'mongoose';
import Employee from './models/Employee.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial Admin
    await seedInitialAdmin();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedInitialAdmin = async () => {
  try {
    // Check if an Admin already exists
    const adminExists = await Employee.findOne({ role: 'Admin' });
    
    if (!adminExists) {
      console.log('No Admin user found. Seeding default Admin...');
      
      const defaultAdmin = new Employee({
        loginId: 'ADMI20260001', // Custom ID format for the Admin
        email: 'admin@company.com',
        password: 'AdminPassword123', // apne aap hash ho jaega
        role: 'Admin',
        profile: {
          firstName: 'System',
          lastName: 'Admin',
          address: 'Headquarters',
          phone: '+91 8955315275'
        },
        salary: {
          base: 10000,
          hra: 3000,
          allowances: 2000
        }
      });

      await defaultAdmin.save();
      console.log('----------------------------------------------------');
      console.log('Default Admin Seeded Successfully!');
      console.log('Login ID: ADMI20260001');
      console.log('Password: AdminPassword123');
      console.log('----------------------------------------------------');
    } else {
      console.log('Admin user already exists. Seeding skipped.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};
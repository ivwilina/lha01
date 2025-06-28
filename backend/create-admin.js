const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/admin.model');

const databaseName = "onlineStudyDB";
const url = `mongodb://localhost:27017/${databaseName}`;

async function createDefaultAdmin() {
  try {
    await mongoose.connect(url);
    console.log('Connected to database!');

    // Kiểm tra xem đã có admin nào chưa
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Username:', existingAdmin.username);
      process.exit(0);
    }

    // Tạo admin mặc định
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const defaultAdmin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    await defaultAdmin.save();
    
    console.log('Default admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@example.com');
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createDefaultAdmin();

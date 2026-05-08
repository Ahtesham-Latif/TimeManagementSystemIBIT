import Admin from '../models/Admin.js'; // Adjust path if you use an index.js model exporter
import bcrypt from 'bcryptjs';

// --- SECURE ADMIN LOGIN ---
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Find admin by email (ensuring case-insensitivity)
    const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare the plain text password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Strip the password before sending the user data back
    const adminData = admin.toJSON();
    delete adminData.password;

    res.status(200).json({
      message: "Login successful",
      data: adminData
    });

  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};

// --- CREATE SECURE ADMIN ---
export const createAdmin = async (req, res) => {
  try {
    const { admin_name, email, password, permissions_level } = req.body;

    if (!admin_name || !email || !password) {
      return res.status(400).json({ message: "admin_name, email, and password are required" });
    }

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Save using the hashed password
    const newAdmin = await Admin.create({ 
      admin_name, 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      permissions_level 
    });

    // 3. Remove password from the response
    const adminData = newAdmin.toJSON();
    delete adminData.password;

    res.status(201).json({
      message: "Admin created successfully",
      data: adminData
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

// (You can also add getAllAdmins, getAdminById, updateAdmin, deleteAdmin here just like you did for Teachers)
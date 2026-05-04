import { Admin } from '../models/index.js';

export const createAdmin = async (req, res) => {
  try {
    const { admin_name, email, password, permissions_level } = req.body;

    if (!admin_name || !email || !password) {
      return res.status(400).json({ message: "admin_name, email, and password are required" });
    }

    const newAdmin = await Admin.create({ admin_name, email, password, permissions_level });

    res.status(201).json({
      message: "Admin created successfully",
      data: newAdmin
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json({
      message: "Admins retrieved successfully",
      data: admins
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins", error: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Admin retrieved successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admin", error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_name, email, password, permissions_level } = req.body;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.update({ admin_name, email, password, permissions_level });

    res.status(200).json({
      message: "Admin updated successfully",
      data: admin
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.destroy();

    res.status(200).json({
      message: "Admin deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

import { Teacher } from '../models/index.js';
import bcrypt from 'bcryptjs'; // Import bcryptjs

export const createTeacher = async (req, res) => {
  try {
    const { teacher_name, email, password, courses } = req.body;

    if (!teacher_name || !email || !password) {
      return res.status(400).json({ message: "teacher_name, email, and password are required" });
    }

    // 1. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Save using the hashed password and lowercase email
    const newTeacher = await Teacher.create({ 
      teacher_name, 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      courses 
    });

    // 3. Remove password from the response data for security
    const teacherData = newTeacher.toJSON();
    delete teacherData.password;

    res.status(201).json({
      message: "Teacher created successfully",
      data: teacherData
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error creating teacher", error: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    
    // Optional: map through and remove passwords before sending the list
    const safeTeachers = teachers.map(teacher => {
      const data = teacher.toJSON();
      delete data.password;
      return data;
    });

    res.status(200).json({
      message: "Teachers retrieved successfully",
      data: safeTeachers
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving teachers", error: error.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherData = teacher.toJSON();
    delete teacherData.password;

    res.status(200).json({
      message: "Teacher retrieved successfully",
      data: teacherData
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving teacher", error: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_name, email, password, courses } = req.body;

    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 1. Prepare an object with the updates
    const updateData = { teacher_name, courses };
    if (email) updateData.email = email.toLowerCase();

    // 2. Only hash and update the password IF it was provided in the request
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await teacher.update(updateData);

    const teacherData = teacher.toJSON();
    delete teacherData.password;

    res.status(200).json({
      message: "Teacher updated successfully",
      data: teacherData
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error updating teacher", error: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await teacher.destroy();

    res.status(200).json({
      message: "Teacher deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher", error: error.message });
  }
};

// --- NEW SECURE LOGIN FUNCTION ---
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Find teacher by email
    const teacher = await Teacher.findOne({ where: { email: email.toLowerCase() } });
    
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Verify hashed password
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Remove password before sending user data back
    const teacherData = teacher.toJSON();
    delete teacherData.password;

    res.status(200).json({
      message: "Login successful",
      data: teacherData
    });

  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};
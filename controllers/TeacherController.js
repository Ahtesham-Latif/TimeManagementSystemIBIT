import { Teacher } from '../models/index.js';

export const createTeacher = async (req, res) => {
  try {
    const { teacher_name, email, password, courses } = req.body;

    if (!teacher_name || !email || !password) {
      return res.status(400).json({ message: "teacher_name, email, and password are required" });
    }

    const newTeacher = await Teacher.create({ teacher_name, email, password, courses });

    res.status(201).json({
      message: "Teacher created successfully",
      data: newTeacher
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
    res.status(200).json({
      message: "Teachers retrieved successfully",
      data: teachers
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

    res.status(200).json({
      message: "Teacher retrieved successfully",
      data: teacher
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

    await teacher.update({ teacher_name, email, password, courses });

    res.status(200).json({
      message: "Teacher updated successfully",
      data: teacher
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

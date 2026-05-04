import { Course } from '../models/index.js';

export const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, credit_hours } = req.body;

    if (!course_code || !course_name) {
      return res.status(400).json({ message: "course_code and course_name are required" });
    }

    const newCourse = await Course.create({ course_code, course_name, credit_hours });

    res.status(201).json({
      message: "Course created successfully",
      data: newCourse
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Course code already exists" });
    }
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json({
      message: "Courses retrieved successfully",
      data: courses
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course retrieved successfully",
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, credit_hours } = req.body;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.update({ course_code, course_name, credit_hours });

    res.status(200).json({
      message: "Course updated successfully",
      data: course
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Course code already exists" });
    }
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.destroy();

    res.status(200).json({
      message: "Course deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
};

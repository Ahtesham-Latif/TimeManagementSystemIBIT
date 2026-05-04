import { Specialization } from '../models/index.js';

export const createSpecialization = async (req, res) => {
  try {
    const { spec_name, spec_color } = req.body;

    if (!spec_name) {
      return res.status(400).json({ message: "spec_name is required" });
    }

    const newSpecialization = await Specialization.create({ spec_name, spec_color });

    res.status(201).json({
      message: "Specialization created successfully",
      data: newSpecialization
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Specialization name already exists" });
    }
    res.status(500).json({ message: "Error creating specialization", error: error.message });
  }
};

export const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.findAll();
    res.status(200).json({
      message: "Specializations retrieved successfully",
      data: specializations
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving specializations", error: error.message });
  }
};

export const getSpecializationById = async (req, res) => {
  try {
    const { id } = req.params;
    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    res.status(200).json({
      message: "Specialization retrieved successfully",
      data: specialization
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving specialization", error: error.message });
  }
};

export const updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { spec_name, spec_color } = req.body;

    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    await specialization.update({ spec_name, spec_color });

    res.status(200).json({
      message: "Specialization updated successfully",
      data: specialization
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Specialization name already exists" });
    }
    res.status(500).json({ message: "Error updating specialization", error: error.message });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const specialization = await Specialization.findByPk(id);

    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    await specialization.destroy();

    res.status(200).json({
      message: "Specialization deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting specialization", error: error.message });
  }
};

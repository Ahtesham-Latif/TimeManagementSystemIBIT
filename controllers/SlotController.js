import { Slot } from '../models/index.js';

export const createSlot = async (req, res) => {
  try {
    const { slot_name, start_time, end_time } = req.body;

    if (!slot_name || !start_time || !end_time) {
      return res.status(400).json({ message: "slot_name, start_time, and end_time are required" });
    }

    const existingSlot = await Slot.findOne({
      where: { slot_name }
    });

    if (existingSlot) {
      return res.status(400).json({ message: "Slot name already exists" });
    }

    const newSlot = await Slot.create({ slot_name, start_time, end_time });

    res.status(201).json({
      message: "Slot created successfully",
      data: newSlot
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating slot", error: error.message });
  }
};

export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.findAll();
    res.status(200).json({
      message: "Slots retrieved successfully",
      data: slots
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving slots", error: error.message });
  }
};

export const getSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.status(200).json({
      message: "Slot retrieved successfully",
      data: slot
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving slot", error: error.message });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slot_name, start_time, end_time } = req.body;

    const slot = await Slot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot_name !== undefined) {
      const duplicateSlot = await Slot.findOne({
        where: { slot_name }
      });

      if (duplicateSlot && duplicateSlot.slot_table_id !== slot.slot_table_id) {
        return res.status(400).json({ message: "Slot name already exists" });
      }
    }

    await slot.update({ slot_name, start_time, end_time });

    res.status(200).json({
      message: "Slot updated successfully",
      data: slot
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating slot", error: error.message });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    await slot.destroy();

    res.status(200).json({
      message: "Slot deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting slot", error: error.message });
  }
};

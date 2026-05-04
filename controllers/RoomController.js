import { Room } from '../models/index.js';

export const createRoom = async (req, res) => {
  try {
    const { room_name, capacity, location_details } = req.body;

    if (!room_name) {
      return res.status(400).json({ message: "room_name is required" });
    }

    const newRoom = await Room.create({ room_name, capacity, location_details });

    res.status(201).json({
      message: "Room created successfully",
      data: newRoom
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Room name already exists" });
    }
    res.status(500).json({ message: "Error creating room", error: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json({
      message: "Rooms retrieved successfully",
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rooms", error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room retrieved successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving room", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, capacity, location_details } = req.body;

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.update({ room_name, capacity, location_details });

    res.status(200).json({
      message: "Room updated successfully",
      data: room
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Room name already exists" });
    }
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.destroy();

    res.status(200).json({
      message: "Room deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
};

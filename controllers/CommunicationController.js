import { Communication } from '../models/index.js';

export const createCommunication = async (req, res) => {
  try {
    const { sender_id, receiver_id, msg_type, content, status } = req.body;

    if (!sender_id || !msg_type || !content) {
      return res.status(400).json({ message: "sender_id, msg_type, and content are required" });
    }

    const newCommunication = await Communication.create({ 
      sender_id, 
      receiver_id, 
      msg_type, 
      content, 
      status 
    });

    res.status(201).json({
      message: "Communication created successfully",
      data: newCommunication
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating communication", error: error.message });
  }
};

export const getAllCommunications = async (req, res) => {
  try {
    const { sender_id, receiver_id, msg_type, status } = req.query;
    const where = {};

    if (sender_id !== undefined && sender_id !== '') {
      where.sender_id = sender_id;
    }

    if (receiver_id !== undefined && receiver_id !== '') {
      where.receiver_id = receiver_id;
    }

    if (msg_type !== undefined && msg_type !== '') {
      where.msg_type = msg_type;
    }

    if (status !== undefined && status !== '') {
      where.status = status;
    }

    const communications = await Communication.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: "Communications retrieved successfully",
      data: communications
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving communications", error: error.message });
  }
};

export const getCommunicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const communication = await Communication.findByPk(id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.status(200).json({
      message: "Communication retrieved successfully",
      data: communication
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving communication", error: error.message });
  }
};

export const updateCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender_id, receiver_id, msg_type, content, status } = req.body;

    const communication = await Communication.findByPk(id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    await communication.update({ sender_id, receiver_id, msg_type, content, status });

    res.status(200).json({
      message: "Communication updated successfully",
      data: communication
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating communication", error: error.message });
  }
};

export const deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const communication = await Communication.findByPk(id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    await communication.destroy();

    res.status(200).json({
      message: "Communication deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting communication", error: error.message });
  }
};

import { Communication } from '../models/index.js';

const normalizeCommunicationId = (value) => {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  return String(value);
};

const isMeaningfulValue = (value) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === 'string' && value.trim() === '');

const normalizeCommunicationText = (value) => {
  if (!isMeaningfulValue(value)) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const resolveRequestText = (body) => {
  const requestText = normalizeCommunicationText(body.request_text);
  if (requestText !== undefined) {
    return requestText;
  }

  return normalizeCommunicationText(body.content);
};

const buildCommunicationUpdate = (body) => {
  const update = {};

  const senderId = normalizeCommunicationId(body.sender_id);
  const receiverId = normalizeCommunicationId(body.receiver_id);
  const requestText = resolveRequestText(body);
  const responseText = normalizeCommunicationText(body.response_text);

  if (senderId !== undefined) {
    update.sender_id = senderId;
  }

  if (receiverId !== undefined) {
    update.receiver_id = receiverId;
  }

  if (body.msg_type !== undefined && body.msg_type !== null && String(body.msg_type).trim() !== '') {
    update.msg_type = String(body.msg_type).trim();
  }

  if (requestText !== undefined) {
    update.content = requestText;
  }

  if (responseText !== undefined) {
    update.response_text = responseText;
  }

  if (body.status !== undefined && body.status !== null && String(body.status).trim() !== '') {
    update.status = String(body.status).trim();
  }

  return update;
};

export const createCommunication = async (req, res) => {
  try {
    const { sender_id, receiver_id, msg_type, status } = req.body;
    const content = resolveRequestText(req.body);
    const response_text = normalizeCommunicationText(req.body.response_text);

    if (!sender_id || !msg_type || !content) {
      return res.status(400).json({ message: "sender_id, msg_type, and content are required" });
    }

    const newCommunication = await Communication.create({
      sender_id: normalizeCommunicationId(sender_id),
      receiver_id: normalizeCommunicationId(receiver_id),
      msg_type: String(msg_type).trim(),
      content,
      response_text,
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
    const { sender_id, receiver_id, msg_type, status, response_text } = req.query;
    const where = {};

    if (sender_id !== undefined && sender_id !== '') {
      where.sender_id = normalizeCommunicationId(sender_id);
    }

    if (receiver_id !== undefined && receiver_id !== '') {
      where.receiver_id = normalizeCommunicationId(receiver_id);
    }

    if (msg_type !== undefined && msg_type !== '') {
      where.msg_type = msg_type;
    }

    if (status !== undefined && status !== '') {
      where.status = status;
    }

    if (response_text !== undefined && response_text !== '') {
      where.response_text = response_text;
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

    const communication = await Communication.findByPk(id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    const updates = buildCommunicationUpdate(req.body);

    await communication.update(updates);

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

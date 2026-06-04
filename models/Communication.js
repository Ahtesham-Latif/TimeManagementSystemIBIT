import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Communication = sequelize.define('Communication', {
  comm_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.STRING, allowNull: false },
  receiver_id: { type: DataTypes.STRING },
  msg_type: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  response_text: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }
}, { tableName: 'Communication', timestamps: true });

export default Communication;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Communication = sequelize.define('Communication', {
  comm_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER },
  msg_type: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }
}, { tableName: 'Communication', timestamps: true });

export default Communication;
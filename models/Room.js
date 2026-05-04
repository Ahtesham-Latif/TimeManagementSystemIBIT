import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Room = sequelize.define('Room', {
  room_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  room_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  capacity: { type: DataTypes.INTEGER },
  location_details: { type: DataTypes.STRING }
}, { tableName: 'Room', timestamps: false });

export default Room;
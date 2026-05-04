import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Slot = sequelize.define('Slot', {
  slot_table_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slot_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  start_time: { type: DataTypes.STRING, allowNull: false },
  end_time: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'Slot', timestamps: false });

export default Slot;

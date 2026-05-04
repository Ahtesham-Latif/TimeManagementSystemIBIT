import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Schedule = sequelize.define('Schedule', {
  schedule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  day: { type: DataTypes.STRING, allowNull: false },
  slot_color: { type: DataTypes.STRING },
  batch_id: { type: DataTypes.INTEGER, allowNull: false },
  section_name: { type: DataTypes.STRING, allowNull: true },
  course_id: { type: DataTypes.INTEGER, allowNull: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: true },
  room_id: { type: DataTypes.INTEGER, allowNull: true },
  slot_table_id: { type: DataTypes.INTEGER, allowNull: true },
  spec_id: { type: DataTypes.INTEGER, allowNull: true },
  audience_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'Schedule', timestamps: false });

export default Schedule;
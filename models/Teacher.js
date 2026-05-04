import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Teacher = sequelize.define('Teacher', {
  teacher_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  courses: { type: DataTypes.STRING }
}, { tableName: 'Teacher', timestamps: false });

export default Teacher;

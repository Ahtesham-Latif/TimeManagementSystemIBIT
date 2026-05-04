import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Course = sequelize.define('Course', {
  course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  course_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  course_name: { type: DataTypes.STRING, allowNull: false },
  credit_hours: { type: DataTypes.INTEGER }
}, { tableName: 'Course', timestamps: false });

export default Course;
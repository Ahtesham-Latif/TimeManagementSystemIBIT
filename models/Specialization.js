import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Specialization = sequelize.define('Specialization', {
  spec_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  spec_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  spec_color: { type: DataTypes.STRING }
}, { tableName: 'Specialization', timestamps: false });

export default Specialization;
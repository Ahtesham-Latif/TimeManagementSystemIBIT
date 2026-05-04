import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  admin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admin_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  permissions_level: { type: DataTypes.STRING }
}, { tableName: 'Admin', timestamps: false });

export default Admin;
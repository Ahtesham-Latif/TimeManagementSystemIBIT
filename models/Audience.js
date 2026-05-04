import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Audience = sequelize.define('Audience', {
  audience_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  audience_label: { type: DataTypes.STRING, allowNull: false, unique: true },
  section_names: { type: DataTypes.STRING }, // Legacy cache of linked section names like MA+MB
  is_compulsory: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'Audience', timestamps: false });

export default Audience;

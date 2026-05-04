import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AudienceSection = sequelize.define('AudienceSection', {
  audience_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  section_name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  }
}, { tableName: 'AudienceSection', timestamps: false });

export default AudienceSection;

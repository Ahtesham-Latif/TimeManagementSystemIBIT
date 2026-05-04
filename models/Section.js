import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Section = sequelize.define('Section', {
  section_name: { 
    type: DataTypes.STRING, 
    primaryKey: true, 
    allowNull: false 
  }
}, { tableName: 'Section', timestamps: false });

export default Section;
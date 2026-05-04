// models/Batch.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Batch = sequelize.define('Batch', {
    batch_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    batch_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
}, { 
    tableName: 'Batch',
    timestamps: false 
});

export default Batch;
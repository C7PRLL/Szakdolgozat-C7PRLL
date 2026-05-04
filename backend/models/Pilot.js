const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pilot = sequelize.define('Pilot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nationality: { type: DataTypes.STRING },
    birth_date: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.STRING },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'pilots' });

module.exports = Pilot;
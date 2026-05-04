const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define('Result', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    position: { type: DataTypes.INTEGER },
    issue: { type: DataTypes.STRING },
    team: { type: DataTypes.STRING },
    car_type: { type: DataTypes.STRING },
    engine: { type: DataTypes.STRING }
}, { tableName: 'results', timestamps: false });

module.exports = Result;
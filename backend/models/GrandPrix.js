const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GrandPrix = sequelize.define('GrandPrix', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    race_date: { type: DataTypes.DATEONLY, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING }
}, { tableName: 'grand_prix', timestamps: false });

module.exports = GrandPrix;
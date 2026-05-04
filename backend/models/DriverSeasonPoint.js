const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DriverSeasonPoint = sequelize.define(
  'DriverSeasonPoint',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    season_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    wins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fetched_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'driver_season_points',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['season_year', 'driver_id'],
      },
    ],
  }
);

module.exports = DriverSeasonPoint;
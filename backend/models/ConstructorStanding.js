const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConstructorStanding = sequelize.define(
  'ConstructorStanding',
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
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    constructor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'constructor_standings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = ConstructorStanding;
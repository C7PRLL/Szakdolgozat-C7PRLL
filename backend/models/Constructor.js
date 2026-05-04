const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Constructor = sequelize.define(
  'Constructor',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wiki_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'constructors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Constructor;
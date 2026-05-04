const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Driver = sequelize.define(
  'Driver',
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
    given_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    family_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permanent_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    wiki_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    headshot_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    first_season: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_season: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Driver;
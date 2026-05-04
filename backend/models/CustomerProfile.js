const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerProfile = sequelize.define(
  'CustomerProfile',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferred_language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'hu',
    },
    marketing_consent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    liability_accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'customer_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = CustomerProfile;
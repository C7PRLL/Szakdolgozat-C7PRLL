const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time_slot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    participant_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Booking;
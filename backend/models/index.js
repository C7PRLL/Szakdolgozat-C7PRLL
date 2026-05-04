const sequelize = require('../config/database');

const User = require('./User');
const CustomerProfile = require('./CustomerProfile');
const Booking = require('./Booking');
const Driver = require('./Driver');
const Constructor = require('./Constructor');
const DriverStanding = require('./DriverStanding');
const ConstructorStanding = require('./ConstructorStanding');
const DriverSeasonPoint = require('./DriverSeasonPoint');
const NewsArticle = require('./NewsArticle');

// User -> CustomerProfile
User.hasOne(CustomerProfile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE',
});

CustomerProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User -> Booking
User.hasMany(Booking, {
  foreignKey: 'user_id',
  as: 'bookings',
  onDelete: 'CASCADE',
});

Booking.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Driver -> DriverStanding
Driver.hasMany(DriverStanding, {
  foreignKey: 'driver_id',
  as: 'standings',
  onDelete: 'CASCADE',
});

DriverStanding.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
});

// Driver -> DriverSeasonPoint
Driver.hasMany(DriverSeasonPoint, {
  foreignKey: 'driver_id',
  as: 'season_points',
  onDelete: 'CASCADE',
});

DriverSeasonPoint.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
});

// Constructor -> DriverStanding
Constructor.hasMany(DriverStanding, {
  foreignKey: 'constructor_id',
  as: 'driver_standings',
  onDelete: 'SET NULL',
});

DriverStanding.belongsTo(Constructor, {
  foreignKey: 'constructor_id',
  as: 'constructor',
});

// Constructor -> ConstructorStanding
Constructor.hasMany(ConstructorStanding, {
  foreignKey: 'constructor_id',
  as: 'constructor_standings',
  onDelete: 'CASCADE',
});

ConstructorStanding.belongsTo(Constructor, {
  foreignKey: 'constructor_id',
  as: 'constructor',
});

const db = {
  sequelize,
  User,
  CustomerProfile,
  Booking,
  Driver,
  Constructor,
  DriverStanding,
  ConstructorStanding,
  DriverSeasonPoint,
  NewsArticle,
};

module.exports = db;
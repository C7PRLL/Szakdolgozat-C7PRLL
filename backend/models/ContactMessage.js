const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    message: DataTypes.TEXT,
    newsletter: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'contact_messages' });

module.exports = ContactMessage;
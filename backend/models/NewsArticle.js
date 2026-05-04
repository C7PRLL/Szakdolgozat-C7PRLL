const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsArticle = sequelize.define(
  'NewsArticle',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    source_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    image_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    content_snippet: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'news_articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = NewsArticle;
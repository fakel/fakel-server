const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Summoner extends Model {}

Summoner.init({
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  internalName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  afk: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  inter: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  troll: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  flamer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  good: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, { sequelize, modelName: 'summoner' });

module.exports = Summoner;

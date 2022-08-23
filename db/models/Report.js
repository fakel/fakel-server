const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Report extends Model {}

Report.init({
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
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  afk: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  inter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  troll: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  flamer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  good: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gameId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { sequelize, modelName: 'report' });

module.exports = Report;

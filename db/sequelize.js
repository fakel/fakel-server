const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

if (process.env.NODE_ENV === 'development') {
  mysql.createConnection(process.env.DATABASE_URL || 'mysql://root:secret@localhost:3306').then((connection) => {
    connection.query('CREATE DATABASE IF NOT EXISTS db;').then(() => {
      console.log('Nice');
    });
  });
}

const sequelize = new Sequelize(process.env.DATABASE_URL || 'mysql://root:secret@localhost:3306/db'); // Example for postgres

module.exports = sequelize;

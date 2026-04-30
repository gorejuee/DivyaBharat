require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'sacredpath_user',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'divyabharat_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
};
require('dotenv').config();

const base = {
  dialect: 'postgres',
  logging: false
};

const config = process.env.DATABASE_URL
  ? { ...base, url: process.env.DATABASE_URL, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
  : { ...base, username: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, host: process.env.DB_HOST };

module.exports = { development: config, production: config };
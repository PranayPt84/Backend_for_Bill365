require('dotenv').config(); // Load environment variables from .env file

const config = {
  PORT: process.env.PORT || 5003,
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_DATABASE: process.env.DB_DATABASE || 'Bill_365_db',
  DB_PASSWORD: process.env.DB_PASSWORD || '1234',
  DB_PORT: process.env.DB_PORT || 5432,
  SECRET_KEY: process.env.SECRET_KEY || 'your_secret_key', // Change this to a secure key
  SESSION_SECRET:process.env.SESSION_SECRET || 'mySecrateKey'
};

module.exports = config;
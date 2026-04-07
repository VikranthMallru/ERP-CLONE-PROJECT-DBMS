const { Pool } = require('pg');

const bankDB = new Pool({
  user: process.env.BANK_DB_USER || 'postgres',
  host: process.env.BANK_DB_HOST || 'localhost',
  database: process.env.BANK_DB_NAME || 'bank-db',
  password: process.env.BANK_DB_PASSWORD || 'Saravan@oct2',
  port: Number(process.env.BANK_DB_PORT) || 5432,
});

module.exports = bankDB;
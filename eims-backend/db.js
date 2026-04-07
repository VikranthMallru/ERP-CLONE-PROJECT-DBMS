const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eims-clone',
  password: process.env.DB_PASSWORD || 'Saravan@oct2',
  port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;
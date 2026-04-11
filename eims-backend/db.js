const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'eims-clone',
      password: process.env.DB_PASSWORD || 'Saravan@oct2',
      port: Number(process.env.DB_PORT) || 5432,
    });

module.exports = pool;
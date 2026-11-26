
const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true }
      }
    : {
        host: "localhost",
        port: 5432,
        database: "sweet_heaven_db",
        user: "postgres",
        password: process.env.DB_PASSWORD
      }
);

module.exports = pool;

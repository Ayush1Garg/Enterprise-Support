const { Pool } = require("pg");
require("dotenv").config();

// Use DATABASE_URL if available in the environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:LENOVO@localhost:5432/Solar",
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;

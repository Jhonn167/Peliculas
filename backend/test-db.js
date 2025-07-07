const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ Conexión exitosa:", res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en la conexión:", err);
    process.exit(1);
  }
}

testConnection();
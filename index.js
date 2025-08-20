import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Postgres connection
// const pool = new Pool({
//   user: process.env.DB_USER,      // change if needed
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,   // must exist in Postgres
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // needed on Render
});


// Create table if not exists
await pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
  );
`);

// Routes
app.get("/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/notes", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Note content required" });

  const result = await pool.query(
    "INSERT INTO notes (content) VALUES ($1) RETURNING *",
    [content]
  );
  res.json(result.rows[0]);
});

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

import cors from "cors";
import path from "path";
import express from "express";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);
app.use(express.json());

// Serve React build files
app.use(express.static(path.join(__dirname, "..", "build")));

// Database Connection
const db = new sqlite3.Database("./task_app.db", (err) => {
  if (err) console.error("❌ DB Connection Error:", err.message);
  else console.log("✅ Connected to SQLite");
});

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    question_text TEXT,
    options TEXT,
    correct_answer TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    quiz_id INTEGER,
    score INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )`);
});

/* ================= API ROUTES ================= */

// Register
app.post("/api/register", (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing required fields" });

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, existingUser) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (existingUser)
        return res.status(400).json({ error: "Email already exists" });

      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role],
        function (err) {
          if (err) return res.status(500).json({ error: "Create user failed" });
          res.json({
            id: this.lastID,
            name,
            email,
            role,
            message: "Registered successfully",
          });
        }
      );
    }
  );
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });
});

// Get all quizzes
app.get("/api/quizzes", (req, res) => {
  db.all(
    `SELECT q.*, (SELECT COUNT(DISTINCT user_id) FROM results WHERE quiz_id = q.id) as completed_count
     FROM quizzes q ORDER BY q.created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get quiz detail
app.get("/api/quizzes/:id", (req, res) => {
  db.get("SELECT * FROM quizzes WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Quiz not found" });
    res.json(row);
  });
});

// Get questions for a quiz
app.get("/api/quizzes/:id/questions", (req, res) => {
  db.all(
    "SELECT * FROM questions WHERE quiz_id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const questions = rows.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
      }));
      res.json(questions);
    }
  );
});

// Create quiz
app.post("/api/quizzes", (req, res) => {
  const { title, description } = req.body;
  db.run(
    "INSERT INTO quizzes (title, description) VALUES (?, ?)",
    [title, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description });
    }
  );
});

// Add question
app.post("/api/quizzes/:id/questions", (req, res) => {
  const { question_text, options, correct_answer } = req.body;
  db.run(
    "INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)",
    [req.params.id, question_text, JSON.stringify(options), correct_answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, question_text });
    }
  );
});

// Submit result
app.post("/api/results", (req, res) => {
  const { userId, quizId, score } = req.body;
  db.get(
    "SELECT * FROM results WHERE user_id = ? AND quiz_id = ?",
    [userId, quizId],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing) {
        db.run(
          "UPDATE results SET score = ?, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND quiz_id = ?",
          [score, userId, quizId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Score updated" });
          }
        );
      } else {
        db.run(
          "INSERT INTO results (user_id, quiz_id, score) VALUES (?, ?, ?)",
          [userId, quizId, score],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Score saved", id: this.lastID });
          }
        );
      }
    }
  );
});

// Get user results
app.get("/api/my-results/:userId", (req, res) => {
  db.all(
    "SELECT * FROM results WHERE user_id = ?",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get all results (Admin)
app.get("/api/all-results", (req, res) => {
  db.all(
    `SELECT r.*, u.name as user_name, u.email as user_email, q.title as quiz_title
     FROM results r
     JOIN users u ON r.user_id = u.id
     JOIN quizzes q ON r.quiz_id = q.id
     ORDER BY r.completed_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Delete quiz (Cascade delete)
app.delete("/api/quizzes/:id", (req, res) => {
  const id = req.params.id;
  db.serialize(() => {
    db.run("DELETE FROM questions WHERE quiz_id = ?", [id]);
    db.run("DELETE FROM results WHERE quiz_id = ?", [id]);
    db.run("DELETE FROM quizzes WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Quiz deleted" });
    });
  });
});

// Catch-all Route for React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

app.use(express.json());

// Serve static files from React build folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
}

// Kết nối DB
const db = new sqlite3.Database("./task_app.db", (err) => {
  if (err) console.error("❌ Lỗi kết nối DB:", err);
  else console.log("✅ Đã kết nối SQLite!");
});

// Tạo bảng
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    question_text TEXT,
    options TEXT,
    correct_answer TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    quiz_id INTEGER,
    score INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )
`);

// Tạo user mặc định
// db.get("SELECT * FROM users WHERE email = 'admin@test.com'", (err, row) => {
//   if (!row) {
//     db.run(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       ["Admin", "admin@test.com", "123456", "admin"]
//     );
//     console.log("✅ Đã tạo admin mặc định: admin@test.com / 123456");
//   }
// });

// db.get("SELECT * FROM users WHERE email = 'user@test.com'", (err, row) => {
//   if (!row) {
//     db.run(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       ["User Test", "user@test.com", "123456", "user"]
//     );
//     console.log("✅ Đã tạo user mặc định: user@test.com / 123456");
//   }
// });


// API đăng ký user mới
app.post("/api/register", (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  console.log("📝 Register attempt:", { name, email, role });

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin." });
  }

  // Kiểm tra email đã tồn tại chưa
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Lỗi server." });
    }

    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng." });
    }

    // Tạo user mới
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role],
      function (err) {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: "Lỗi tạo tài khoản." });
        }

        console.log("✅ User created successfully:", email);
        res.json({
          id: this.lastID,
          name,
          email,
          role,
          message: "Đăng ký thành công!"
        });
      }
    );
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend đang chạy!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/quizzes",
      "POST /api/login",
      "GET /api/my-results/:userId",
      "POST /api/results",
    ],
  });
});

// API đăng nhập
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("📧 Login attempt:", email);

  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Lỗi server." });
    }

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    if (user.password !== password) {
      console.log("Wrong password for:", email);
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    console.log("✅ Login successful:", email);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });
});

// API lấy danh sách quiz
app.get("/api/quizzes", (req, res) => {
  db.all(
    `SELECT 
    q.*,
    (SELECT COUNT(DISTINCT user_id) FROM results WHERE quiz_id = q.id) as completed_count
    FROM quizzes q
    ORDER BY q.created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error("Error fetching quizzes:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Quizzes fetched: ${rows.length} quizzes`);
      // Debug từng quiz
      rows.forEach((quiz) => {
        console.log(
          `Quiz ${quiz.id}: "${quiz.title}" - ${quiz.completed_count} students`
        );
      });
      res.json(rows);
    }
  );
});

// API lấy chi tiết 1 quiz
app.get("/api/quizzes/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM quizzes WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching quiz:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: "Quiz không tồn tại" });
    res.json(row);
  });
});

// API lấy câu hỏi của 1 quiz
app.get("/api/quizzes/:id/questions", (req, res) => {
  const { id } = req.params;
  console.log(`📝 Fetching questions for quiz ${id}...`);

  db.all("SELECT * FROM questions WHERE quiz_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error fetching questions:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ Found ${rows.length} questions for quiz ${id}`);

    // Parse options từ JSON string thành array
    const questionsWithParsedOptions = rows.map((question) => ({
      ...question,
      options: JSON.parse(question.options),
    }));

    res.json(questionsWithParsedOptions);
  });
});

// Thêm quiz mới
app.post("/api/quizzes", (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Thiếu thông tin quiz!" });
  }

  db.run(
    "INSERT INTO quizzes (title, description) VALUES (?, ?)",
    [title, description],
    function (err) {
      if (err) {
        console.error("Error adding quiz:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, title, description });
    }
  );
});

// API thêm câu hỏi vào quiz
app.post("/api/quizzes/:id/questions", (req, res) => {
  const { id } = req.params;
  const { question_text, options, correct_answer } = req.body;

  console.log("➕ Adding question to quiz:", id);
  console.log("Question data:", { question_text, options, correct_answer });

  if (!question_text || !options || !correct_answer) {
    return res.status(400).json({ error: "Thiếu thông tin câu hỏi!" });
  }

  // Validate options là array
  if (!Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ error: "Options phải là mảng 4 phần tử!" });
  }

  db.run(
    "INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)",
    [id, question_text, JSON.stringify(options), correct_answer],
    function (err) {
      if (err) {
        console.error("Error adding question:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("✅ Question added successfully, ID:", this.lastID);
      res.json({
        id: this.lastID,
        quiz_id: parseInt(id),
        question_text,
        options: options,
        correct_answer,
      });
    }
  );
});

// API xóa câu hỏi
app.delete("/api/questions/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting question ${id}...`);

  db.run("DELETE FROM questions WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting question:", err);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Câu hỏi không tồn tại" });
    }

    console.log("✅ Question deleted successfully");
    res.json({ message: "Xóa câu hỏi thành công!" });
  });
});

// API lấy kết quả của 1 user
app.get("/api/my-results/:userId", (req, res) => {
  const { userId } = req.params;
  console.log("Fetching results for user:", userId);

  db.all("SELECT * FROM results WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching results:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API lấy tất cả kết quả của tất cả users (cho admin)
app.get("/api/all-results", (req, res) => {
  console.log("📊 Fetching all results for admin...");

  db.all(
    `
    SELECT 
      r.*,
      u.name as user_name,
      u.email as user_email,
      q.title as quiz_title
    FROM results r
    JOIN users u ON r.user_id = u.id
    JOIN quizzes q ON r.quiz_id = q.id
    ORDER BY u.name, r.completed_at DESC
  `,
    (err, rows) => {
      if (err) {
        console.error("Error fetching all results:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log(`✅ All results fetched: ${rows.length} records`);
      res.json(rows);
    }
  );
});

// API cập nhật điểm số
app.put("/api/results/:id", (req, res) => {
  const { id } = req.params;
  const { score } = req.body;

  console.log("📝 Updating score for result:", id, "New score:", score);

  if (score === undefined || score === null) {
    return res.status(400).json({ error: "Thiếu thông tin điểm!" });
  }

  const scoreValue = parseInt(score);
  if (isNaN(scoreValue) || scoreValue < 0) {
    return res.status(400).json({ error: "Điểm phải là số dương!" });
  }

  db.run(
    "UPDATE results SET score = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
    [scoreValue, id],
    function (err) {
      if (err) {
        console.error("Error updating score:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Kết quả không tồn tại" });
      }

      console.log("✅ Score updated successfully");
      res.json({ message: "Cập nhật điểm thành công!", id: parseInt(id) });
    }
  );
});

// API lấy học sinh đã làm bài
app.get("/api/quizzes/:id/results", (req, res) => {
  const { id } = req.params;
  console.log(`👥 Fetching students for quiz ${id}...`);

  db.all(
    `
    SELECT u.name, r.score, r.completed_at 
    FROM results r
    JOIN users u ON r.user_id = u.id
    WHERE r.quiz_id = ?
    ORDER BY r.completed_at DESC
  `,
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error fetching quiz results:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Found ${rows.length} students for quiz ${id}:`, rows);
      res.json(rows);
    }
  );
});

// API nộp bài
app.post("/api/results", (req, res) => {
  const { userId, quizId, score } = req.body;
  console.log("Submitting result:", { userId, quizId, score });

  // Kiểm tra xem user đã làm quiz này chưa
  db.get(
    "SELECT * FROM results WHERE user_id = ? AND quiz_id = ?",
    [userId, quizId],
    (err, existing) => {
      if (err) {
        console.error("Error checking existing result:", err);
        return res.status(500).json({ error: err.message });
      }

      if (existing) {
        // Nếu đã làm thì cập nhật điểm
        db.run(
          "UPDATE results SET score = ?, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND quiz_id = ?",
          [score, userId, quizId],
          function (err) {
            if (err) {
              console.error("Error updating result:", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Cập nhật điểm thành công!", id: existing.id });
          }
        );
      } else {
        // Nếu chưa làm thì thêm mới
        db.run(
          "INSERT INTO results (user_id, quiz_id, score) VALUES (?, ?, ?)",
          [userId, quizId, score],
          function (err) {
            if (err) {
              console.error("Error saving result:", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Lưu kết quả thành công!", id: this.lastID });
          }
        );
      }
    }
  );
});

// API xóa quiz
app.delete("/api/quizzes/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting quiz ${id}...`);

  db.serialize(() => {
    db.run("DELETE FROM questions WHERE quiz_id = ?", [id]);
    db.run("DELETE FROM results WHERE quiz_id = ?", [id]);
    db.run("DELETE FROM quizzes WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Error deleting quiz:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("✅ Quiz deleted successfully");
      res.json({ message: "Xóa quiz thành công!" });
    });
  });
});

// API cập nhật quiz
app.put("/api/quizzes/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  console.log("Updating quiz:", id, title, description);

  if (!title || !description) {
    return res.status(400).json({ error: "Thiếu thông tin quiz!" });
  }

  db.run(
    "UPDATE quizzes SET title = ?, description = ? WHERE id = ?",
    [title, description, id],
    function (err) {
      if (err) {
        console.error("Error updating quiz:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Quiz không tồn tại" });
      }

      console.log("Quiz updated successfully");
      res.json({ message: "Cập nhật quiz thành công!", id: parseInt(id) });
    }
  );
});

// API cập nhật câu hỏi
app.put("/api/questions/:id", (req, res) => {
  const { id } = req.params;
  const { question_text, options, correct_answer } = req.body;

  console.log("Updating question:", id, {
    question_text,
    options,
    correct_answer,
  });

  if (!question_text || !options || !correct_answer) {
    return res.status(400).json({ error: "Thiếu thông tin câu hỏi!" });
  }

  // Validate options là array
  if (!Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ error: "Options phải là mảng 4 phần tử!" });
  }

  db.run(
    "UPDATE questions SET question_text = ?, options = ?, correct_answer = ? WHERE id = ?",
    [question_text, JSON.stringify(options), correct_answer, id],
    function (err) {
      if (err) {
        console.error("Error updating question:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Câu hỏi không tồn tại" });
      }

      console.log("✅ Question updated successfully");
      res.json({ message: "Cập nhật câu hỏi thành công!", id: parseInt(id) });
    }
  );
});

// Catch-all route to serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

// Khởi động server
// Use PORT from environment (production) or default to 8000 (development)
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 5000) : 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
  console.log(`🌐 Có thể truy cập từ: http://127.0.0.1:${PORT}`);
  console.log("📧 Tài khoản mặc định:");
  console.log("   Admin: admin@test.com / 123456");
  console.log("   User:  user@test.com / 123456");
  console.log("\n✅ Tất cả API endpoints đã sẵn sàng!");
});

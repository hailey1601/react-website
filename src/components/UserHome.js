import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function UserHome({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchMyResults();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Lỗi tải quizzes:", err);
    }
  };

  const fetchMyResults = async () => {
    try {
      const res = await fetch(`/api/my-results/${user.id}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Lỗi tải kết quả:", err);
    }
  };

  const getQuizResult = (quizId) => {
    return results.find((result) => result.quiz_id === quizId);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 20,
        padding: "10px 30px",
      }}
    >
      <h2>Danh sách bài tập</h2>

      <div style={{ marginBottom: 20 }}>
        <Link
          to="/results"
          style={{ textDecoration: "none", color: "#fb8500" }}
        >
          {user.role === "admin"
            ? "Xem kết quả của các học sinh"
            : "Xem kết quả của tôi"}
        </Link>
      </div>

      {quizzes.map((quiz) => {
        const result = getQuizResult(quiz.id);
        return (
          <div
            key={quiz.id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              marginBottom: 10,
              borderRadius: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 8px rgba(251, 133, 0, 0.2)",
            }}
          >
            <div>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
            </div>

            {user.role === "admin" ? (
              <div>
                <Link to="/results">
                  <button
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      borderRadius: 20,
                      border: "1px solid #ccc",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#F56416";
                      e.target.style.border = "none";
                      e.target.style.color = "white";
                      e.target.style.borderRadius = "20px";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.fontWeight = "bolder"; 
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.border = "1px solid #ccc";
                      e.target.style.fontWeight = "normal"; 
                      e.target.style.color = "black";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Kiểm tra
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ textAlign: "right" }}>
                {result ? (
                  <div>
                    <span style={{ color: "green" }}>Đã làm</span>
                    <br />
                    <strong>Điểm: {result.score}/10</strong>
                  </div>
                ) : (
                  <Link to={`/quiz/${quiz.id}`}>
                    <button
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        borderRadius: 20,
                        border: "1px solid #ccc",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#F56416";
                        e.target.style.border = "none";
                        e.target.style.color = "white";
                        e.target.style.borderRadius = "20px";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.fontWeight = "bolder";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.border = "1px solid #ccc";
                        e.target.style.fontWeight = "normal";
                        e.target.style.color = "black";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Làm bài
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UserHome;

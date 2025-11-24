import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function QuizPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching quiz data for ID: ${id}`);

      const [quizRes, questionsRes] = await Promise.all([
        fetch(`/api/quizzes/${id}`),
        fetch(`/api/quizzes/${id}/questions`),
      ]);

      if (!quizRes.ok) throw new Error(`Quiz error: ${quizRes.status}`);
      if (!questionsRes.ok)
        throw new Error(`Questions error: ${questionsRes.status}`);

      const quizData = await quizRes.json();
      const questionsData = await questionsRes.json();

      console.log("📊 Quiz data:", quizData);
      console.log("❓ Questions data:", questionsData);

      // Validate questions data
      const validatedQuestions = questionsData.map((question, index) => {
        if (!question.options || !Array.isArray(question.options)) {
          console.warn(
            `Question ${index} has invalid options:`,
            question.options
          );
          return {
            ...question,
            options: [
              "Lỗi tải câu hỏi",
              "Vui lòng thử lại",
              "Liên hệ admin",
              "Lỗi hệ thống",
            ],
          };
        }
        return question;
      });

      setQuiz(quizData);
      setQuestions(validatedQuestions);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      setError("Lỗi tải bài tập: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        correct++;
      }
    });

    // Tính điểm theo số câu hỏi thực tế
    const totalQuestions = questions.length;
    return correct;
  };

  const handleSubmit = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setSubmitted(true);

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          quizId: parseInt(id),
          score: calculatedScore,
        }),
      });

      if (!res.ok) throw new Error("Lỗi lưu kết quả");
    } catch (err) {
      console.error("Lỗi lưu kết quả:", err);
    }
  };

  // Hiển thị lỗi
  if (error) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: "20px",
          textAlign: "center",
          background: "#fff5f5",
          color: "#c53030",
        }}
      >
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#F56416",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Đang tải bài tập...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Không tìm thấy bài tập</h2>
        <button onClick={() => navigate("/")}>Quay về trang chủ</button>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 20,
        padding: "20px 30px",
        background: "white",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Header bài tập */}
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "20px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>{quiz.title}</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "1rem" }}>
          {quiz.description}
        </p>
        <p
          style={{ margin: "10px 0 0 0", color: "#F56416", fontWeight: "600" }}
        >
          Số câu hỏi: {questions.length}
        </p>
      </div>

      {!submitted ? (
        <div>
          {/* Thông tin tiến độ */}
          <div
            style={{
              background: "#e2e8f0",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "600", color: "#4a5568" }}>
              Đã trả lời:{" "}
              <span style={{ color: "#F56416" }}>
                {Object.keys(answers).length}
              </span>{" "}
              / {questions.length} câu
            </p>
          </div>

          {/* Kiểm tra nếu không có câu hỏi */}
          {questions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#fff3cd",
                borderRadius: "10px",
                border: "1px solid #ffeaa7",
              }}
            >
              <h3 style={{ color: "#856404" }}>Bài tập chưa có câu hỏi</h3>
              <p style={{ color: "#856404" }}>
                Vui lòng liên hệ admin để thêm câu hỏi
              </p>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "10px 20px",
                  background: "#F56416",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Quay về trang chủ
              </button>
            </div>
          ) : (
            /* Danh sách câu hỏi */
            <div>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    marginBottom: "15px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 15px 0",
                      color: "#1e293b",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    Câu {index + 1}: {question.question_text}
                  </h4>

                  <div>
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px 15px",
                          marginBottom: "8px",
                          background:
                            answers[question.id] === option
                              ? "#f0f9ff"
                              : "#f8fafc",
                          border:
                            answers[question.id] === option
                              ? "2px solid #F56416"
                              : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (answers[question.id] !== option) {
                            e.target.style.background = "#f1f5f9";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (answers[question.id] !== option) {
                            e.target.style.background = "#f8fafc";
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() =>
                            handleAnswerSelect(question.id, option)
                          }
                          style={{
                            marginRight: "12px",
                            transform: "scale(1.2)",
                          }}
                        />
                        <span style={{ fontSize: "1rem" }}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nút nộp bài */}
          {questions.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                style={{
                  padding: "12px 30px",
                  fontSize: "16px",
                  cursor:
                    Object.keys(answers).length === questions.length
                      ? "pointer"
                      : "not-allowed",
                  backgroundColor:
                    Object.keys(answers).length === questions.length
                      ? "#F56416"
                      : "#cbd5e0",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  minWidth: "150px",
                }}
                onMouseEnter={(e) => {
                  if (Object.keys(answers).length === questions.length) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 8px rgba(245, 100, 22, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (Object.keys(answers).length === questions.length) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {Object.keys(answers).length === questions.length
                  ? "🚀 Nộp Bài"
                  : `Còn ${
                      questions.length - Object.keys(answers).length
                    } câu chưa trả lời`}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kết quả sau khi nộp bài */
        <div>
          <div
            style={{
              background: score >= questions.length / 2 ? "#d1fae5" : "#fee2e2",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "20px",
              textAlign: "center",
              border: `2px solid ${
                score >= questions.length / 2 ? "#10b981" : "#ef4444"
              }`,
            }}
          >
            <h3
              style={{
                color: score >= questions.length / 2 ? "#065f46" : "#7f1d1d",
                margin: "0 0 10px 0",
              }}
            >
              {score >= questions.length / 2
                ? "🎉 Chúc mừng!"
                : "💪 Cố gắng hơn nhé!"}
            </h3>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: score >= questions.length / 2 ? "#059669" : "#dc2626",
                margin: 0,
              }}
            >
              Kết quả: {score}/{questions.length} điểm
            </p>
          </div>

          {/* Chi tiết từng câu hỏi */}
          <div>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={question.id}
                  style={{
                    border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                    padding: "20px",
                    marginBottom: "15px",
                    borderRadius: "12px",
                    background: isCorrect ? "#f0fdf4" : "#fef2f2",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 15px 0",
                      color: "#1e293b",
                      fontSize: "1.1rem",
                    }}
                  >
                    Câu {index + 1}: {question.question_text}
                  </h4>

                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ margin: "5px 0" }}>
                      <strong style={{ color: "#4a5568" }}>
                        Đáp án của bạn:
                      </strong>
                      <span
                        style={{
                          color: isCorrect ? "#059669" : "#dc2626",
                          fontWeight: "600",
                          marginLeft: "8px",
                        }}
                      >
                        {userAnswer}
                      </span>
                    </p>

                    <p style={{ margin: "5px 0" }}>
                      <strong style={{ color: "#4a5568" }}>Đáp án đúng:</strong>
                      <span
                        style={{
                          color: "#059669",
                          fontWeight: "600",
                          marginLeft: "8px",
                        }}
                      >
                        {question.correct_answer}
                      </span>
                    </p>
                  </div>

                  <p
                    style={{
                      color: isCorrect ? "#059669" : "#dc2626",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      margin: "10px 0 0 0",
                    }}
                  >
                    {isCorrect ? "✅ Đúng" : "❌ Sai"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Nút quay về */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#F56416",
                color: "white",
                border: "none",
                borderRadius: "25px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(245, 100, 22, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ← Quay về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ResultsPage({ user }) {
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingScore, setEditingScore] = useState(null);
  const [newScore, setNewScore] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === "admin") {
        await Promise.all([fetchAllResults(), fetchQuizzes()]);
      } else {
        await Promise.all([fetchMyResults(), fetchQuizzes()]);
      }
    } catch (err) {
      setError("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyResults = async () => {
    try {
      const res = await fetch(`/api/my-results/${user.id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Lỗi tải kết quả:", err);
      setError("Lỗi tải kết quả cá nhân");
    }
  };

  const fetchAllResults = async () => {
    try {
      console.log("🔄 Đang fetch all-results...");
      const res = await fetch("/api/all-results");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log("📊 Dữ liệu all-results:", data);
      setAllResults(data);
    } catch (err) {
      console.error("Lỗi tải tất cả kết quả:", err);
      setError("Lỗi tải kết quả học sinh");
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Lỗi tải quizzes:", err);
    }
  };

  const getQuizTitle = (quizId) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz ? quiz.title : "Bài tập không xác định";
  };

  // Tính điểm và lấy điểm của users
  const getUserStats = () => {
    if (!Array.isArray(allResults) || allResults.length === 0) {
      console.log("ℹ️ allResults đang trống hoặc không phải mảng");
      return {};
    }

    const userStats = {};

    allResults.forEach((result) => {
      if (!result || typeof result !== "object") return;

      const userId = result.user_id;
      const userName = result.user_name || "Không xác định";
      const userEmail = result.user_email || "Không xác định";
      const score = Number(result.score) || 0;
      const quizId = result.quiz_id;

      if (!userId) return;

      if (!userStats[userId]) {
        userStats[userId] = {
          user_name: userName,
          user_email: userEmail,
          total_score: 0,
          quiz_count: 0,
          results: [],
        };
      }

      userStats[userId].total_score += score;
      userStats[userId].quiz_count += 1;
      userStats[userId].results.push({
        ...result,
        quiz_id: quizId,
        score: score,
      });
    });

    // Tính điểm trung bình
    Object.keys(userStats).forEach((userId) => {
      const stats = userStats[userId];
      stats.average_score =
        stats.quiz_count > 0
          ? (stats.total_score / stats.quiz_count).toFixed(1)
          : 0;
    });

    return userStats;
  };

  // Sửa điểm
  const startEditScore = (result) => {
    setEditingScore(result);
    setNewScore(result.score.toString());
  };

  const cancelEditScore = () => {
    setEditingScore(null);
    setNewScore("");
  };

  const handleUpdateScore = async () => {
    if (!editingScore || !newScore) return;

    const scoreValue = parseInt(newScore);
    if (isNaN(scoreValue) || scoreValue < 0) {
      alert("Điểm phải là số dương!");
      return;
    }

    try {
      const res = await fetch(`/api/results/${editingScore.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreValue }),
      });

      if (res.ok) {
        setEditingScore(null);
        setNewScore("");
        fetchData(); // Reload data
        alert("Cập nhật điểm thành công!");
      } else {
        throw new Error("Lỗi cập nhật điểm");
      }
    } catch (err) {
      console.error("Lỗi cập nhật điểm:", err);
      alert("Lỗi cập nhật điểm: " + err.message);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: "20px 30px",
          background: "white",
          textAlign: "center",
        }}
      >
        <h2>Đang tải dữ liệu...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: "20px 30px",
          background: "white",
          textAlign: "center",
          color: "red",
        }}
      >
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button
          onClick={fetchData}
          style={{
            padding: "10px 20px",
            background: "#F56416",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const userStats = getUserStats();

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 20,
        padding: "20px 30px",
        background: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            border: "none",
            color: "black",
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          {user.role === "admin" ? "Kết quả của học sinh" : "Kết quả của tôi"}
        </h2>

        {user.role === "admin" && (
          <div
            style={{
              background: "#f0f8ff",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            Tổng số học sinh: {Object.keys(userStats).length}
          </div>
        )}
      </div>

      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#fb8500",
          marginBottom: 20,
          display: "inline-block",
          fontWeight: "600",
        }}
      >
        ← Quay lại danh sách bài tập
      </Link>

      {/* Hiển thị cho admin - kết quả tất cả học sinh */}
      {user.role === "admin" ? (
        <div>
          {Object.keys(userStats).length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <h3>Chưa có học sinh nào làm bài tập</h3>
              <p>Kết quả sẽ hiển thị ở đây khi học sinh bắt đầu làm bài</p>
            </div>
          ) : (
            <div>
              {Object.entries(userStats).map(([userId, stats]) => (
                <div
                  key={userId}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    marginBottom: "15px",
                    borderRadius: "15px",
                    background: "#f8fafc",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>
                        {stats.user_name}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {stats.user_email}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                          color: "#F56416",
                          marginBottom: "5px",
                        }}
                      >
                        {stats.average_score}/10
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                        Điểm trung bình
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {stats.results.map((result, index) => (
                      <div
                        key={result.id || index}
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "white",
                          textAlign: "center",
                          position: "relative",
                        }}
                      >
                        {/* Nút sửa điểm cho admin */}
                        {user.role === "admin" && (
                          <button
                            onClick={() => startEditScore(result)}
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              background: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              padding: "2px 6px",
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                            title="Sửa điểm"
                          >
                            ✏️
                          </button>
                        )}

                        {/* Form sửa điểm */}
                        {editingScore?.id === result.id ? (
                          <div style={{ textAlign: "center" }}>
                            <input
                              type="number"
                              value={newScore}
                              onChange={(e) => setNewScore(e.target.value)}
                              min="0"
                              max="10"
                              style={{
                                width: "60px",
                                padding: "4px",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                marginBottom: "5px",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                gap: "5px",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={handleUpdateScore}
                                style={{
                                  padding: "2px 6px",
                                  background: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  cursor: "pointer",
                                }}
                              >
                                ✅
                              </button>
                              <button
                                onClick={cancelEditScore}
                                style={{
                                  padding: "2px 6px",
                                  background: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  cursor: "pointer",
                                }}
                              >
                                ❌
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{ fontWeight: "600", marginBottom: "5px" }}
                            >
                              {getQuizTitle(result.quiz_id)}
                            </div>
                            <div
                              style={{
                                fontSize: "1.2rem",
                                fontWeight: "700",
                                color:
                                  result.score >= 5 ? "#10b981" : "#ef4444",
                              }}
                            >
                              {result.score}/10
                            </div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#94a3b8",
                                marginTop: "5px",
                              }}
                            >
                              {result.completed_at
                                ? new Date(
                                    result.completed_at
                                  ).toLocaleDateString()
                                : "Chưa hoàn thành"}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "15px",
                      padding: "10px",
                      background: "#e2e8f0",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      color: "#4a5568",
                    }}
                  >
                    Đã hoàn thành: {stats.quiz_count} bài tập
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Hiển thị kết quả cá nhân cho user thường */
        <div>
          {results.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <h3>Bạn chưa làm bài tập nào</h3>
              <p>Hãy quay lại trang chủ và bắt đầu làm bài tập!</p>
            </div>
          ) : (
            <div>
              {results.map((result) => (
                <div
                  key={result.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    marginBottom: "15px",
                    borderRadius: "15px",
                    background: "#f8fafc",
                    boxShadow: "0 4px 8px rgba(251, 133, 0, 0.2)",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
                    {getQuizTitle(result.quiz_id)}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#4a5568" }}>Điểm:</strong>
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          color: result.score >= 5 ? "#10b981" : "#ef4444",
                          marginLeft: "8px",
                        }}
                      >
                        {result.score}/10
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#4a5568" }}>Hoàn thành:</strong>
                      <span style={{ marginLeft: "8px" }}>
                        {result.completed_at
                          ? new Date(result.completed_at).toLocaleString()
                          : "Chưa hoàn thành"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultsPage;

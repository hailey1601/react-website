import React, { useState, useEffect } from "react";

function AdminPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStudentPopup, setStudentPopup] = useState(false);
  const [studentResults, setStudentResult] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    questions: [
      {
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: "",
      },
    ],
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data = await res.json();

      // Fetch questions for each quiz
      const quizzesWithQuestions = await Promise.all(
        data.map(async (quiz) => {
          try {
            const questionsRes = await fetch(
              `/api/quizzes/${quiz.id}/questions`
            );
            const questions = await questionsRes.json();
            return {
              ...quiz,
              questions,
              completed_count: quiz.completed_count || 0,
            };
          } catch (err) {
            console.error(`Lỗi tải câu hỏi cho quiz ${quiz.id}:`, err);
            return {
              ...quiz,
              questions: [],
              completed_count: quiz.completed_count || 0,
            };
          }
        })
      );

      setQuizzes(quizzesWithQuestions);
    } catch (err) {
      console.error("Lỗi tải quizzes:", err);
    }
  };

  const fetchStudentResults = async (quizId) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/results`);
      const data = await res.json();
      setStudentResult(data);
    } catch (err) {
      console.log("Lỗi tải kết quả học sinh: ", err);
      setStudentResult([]);
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    try {
      // 1. Tạo bài tập trước
      const quizRes = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
        }),
      });

      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const quizId = quizData.id;

        // 2. Thêm các câu hỏi
        const validQuestions = newQuiz.questions.filter(
          (q) => q.question_text.trim() && q.correct_answer.trim()
        );

        if (validQuestions.length > 0) {
          await Promise.all(
            validQuestions.map((question) =>
              fetch(`/api/quizzes/${quizId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(question),
              })
            )
          );
        }

        // 3. Reset form và reload data
        setNewQuiz({
          title: "",
          description: "",
          questions: [
            {
              question_text: "",
              options: ["", "", "", ""],
              correct_answer: "",
            },
          ],
        });
        setShowAddForm(false);
        fetchQuizzes();
        alert("Tạo bài tập thành công!");
      }
    } catch (err) {
      console.error("Lỗi thêm quiz:", err);
      alert("Lỗi tạo bài tập: " + err.message);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      // 1. Cập nhật thông tin bài tập
      const quizRes = await fetch(`/api/quizzes/${editingQuiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
        }),
      });

      if (quizRes.ok) {
        // 2. Xác định câu hỏi nào cần xóa (câu hỏi cũ không có trong form mới)
        const currentQuestionIds = editingQuiz.questions
          ? editingQuiz.questions.map((q) => q.id)
          : [];
        const questionsToDelete = currentQuestionIds.filter(
          (id) => !newQuiz.questions.some((q) => q.id === id)
        );

        // 3. Xóa các câu hỏi đã bị xóa khỏi form
        if (questionsToDelete.length > 0) {
          await Promise.all(
            questionsToDelete.map((questionId) =>
              fetch(`/api/questions/${questionId}`, { method: "DELETE" })
            )
          );
        }

        // 4. Xử lý từng câu hỏi trong form
        await Promise.all(
          newQuiz.questions.map(async (question) => {
            if (question.id) {
              // Câu hỏi đã tồn tại - cập nhật
              return fetch(`/api/questions/${question.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question_text: question.question_text,
                  options: question.options,
                  correct_answer: question.correct_answer,
                }),
              });
            } else {
              // Câu hỏi mới - thêm mới
              return fetch(`/api/quizzes/${editingQuiz.id}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(question),
              });
            }
          })
        );

        // 5. Reset form và reload data
        setNewQuiz({
          title: "",
          description: "",
          questions: [
            {
              question_text: "",
              options: ["", "", "", ""],
              correct_answer: "",
            },
          ],
        });
        setEditingQuiz(null);
        setShowAddForm(false);
        fetchQuizzes();
        alert("Cập nhật bài tập thành công!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật quiz:", err);
      alert("Lỗi cập nhật bài tập: " + err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài tập này?")) {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchQuizzes();
        }
      } catch (err) {
        console.error("Lỗi xóa quiz:", err);
      }
    }
  };

  const handleDeleteQuestion = async (quizId, questionId) => {
    if (window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      try {
        const res = await fetch(`/api/questions/${questionId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchQuizzes();
        }
      } catch (err) {
        console.error("Lỗi xóa câu hỏi:", err);
      }
    }
  };

  // QUESTION MANAGEMENT
  const addNewQuestion = () => {
    setNewQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          options: ["", "", "", ""],
          correct_answer: "",
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (newQuiz.questions.length > 1) {
      setNewQuiz((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  const updateQuestion = (index, field, value) => {
    setNewQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setNewQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const startEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setNewQuiz({
      title: quiz.title,
      description: quiz.description,
      questions:
        quiz.questions && quiz.questions.length > 0
          ? quiz.questions.map((q) => ({
              id: q.id,
              question_text: q.question_text,
              options: JSON.parse(q.options),
              correct_answer: q.correct_answer,
            }))
          : [
              {
                question_text: "",
                options: ["", "", "", ""],
                correct_answer: "",
              },
            ],
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingQuiz(null);
    setNewQuiz({
      title: "",
      description: "",
      questions: [
        {
          question_text: "",
          options: ["", "", "", ""],
          correct_answer: "",
        },
      ],
    });
    setShowAddForm(false);
  };

  const handleShowPopup = async (quiz) => {
    setSelectedQuiz(quiz);
    await fetchStudentResults(quiz.id);
    setStudentPopup(true);
  };

  const handleClosePopup = () => {
    setStudentPopup(false);
    setSelectedQuiz(null);
    setStudentResult([]);
  };

  return (
    <div>
      <h2>Quản lý bài tập</h2>

      <button
        onClick={() => {
          setShowAddForm(!showAddForm);
          setEditingQuiz(null);
          setNewQuiz({
            title: "",
            description: "",
            questions: [
              {
                question_text: "",
                options: ["", "", "", ""],
                correct_answer: "",
              },
            ],
          });
        }}
        style={{
          marginBottom: 20,
          padding: "10px 15px",
          cursor: "pointer",
          borderRadius: "20px",
          border: "none",
          backgroundColor: showAddForm ? "red" : "#F56416",
          color: "white",
          fontWeight: "600",
          transition: "all 0.3s ease",
        }}
      >
        {showAddForm ? "Hủy" : "Thêm bài tập mới"}
      </button>

      {/* Form thêm/sửa bài tập với câu hỏi */}
      {(showAddForm || editingQuiz) && (
        <form
          onSubmit={editingQuiz ? handleUpdateQuiz : handleAddQuiz}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
            background: "#f8f9fa",
          }}
        >
          <h3>{editingQuiz ? "Sửa bài tập" : "Thêm bài tập mới"}</h3>

          {/* Thông tin bài tập */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 10 }}>Thông tin bài tập</h4>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Tiêu đề bài tập"
                value={newQuiz.title}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, title: e.target.value })
                }
                style={{
                  width: "99%",
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid grey",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <textarea
                placeholder="Mô tả bài tập"
                value={newQuiz.description}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, description: e.target.value })
                }
                style={{
                  width: "99%",
                  padding: 8,
                  height: 60,
                  borderRadius: 10,
                  border: "1px solid grey",
                }}
                required
              />
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h4 style={{ margin: 0 }}>
                Câu hỏi ({newQuiz.questions.length})
              </h4>
              <button
                type="button"
                onClick={addNewQuestion}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  borderRadius: 15,
                  border: "1px solid #28a745",
                  backgroundColor: "transparent",
                  color: "#28a745",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                + Thêm câu hỏi
              </button>
            </div>

            {newQuiz.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                style={{
                  border: "1px solid #ddd",
                  padding: 15,
                  marginBottom: 15,
                  borderRadius: 8,
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <h5 style={{ margin: 0 }}>Câu hỏi {questionIndex + 1}</h5>
                  {newQuiz.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      style={{
                        padding: "2px 8px",
                        cursor: "pointer",
                        borderRadius: 10,
                        border: "none",
                        backgroundColor: "#dc3545",
                        color: "white",
                        fontSize: "10px",
                      }}
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* Nội dung câu hỏi */}
                <div style={{ marginBottom: 10 }}>
                  <textarea
                    placeholder="Nhập nội dung câu hỏi..."
                    value={question.question_text}
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        "question_text",
                        e.target.value
                      )
                    }
                    style={{
                      width: "97%",
                      padding: 8,
                      height: 30,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                    required
                  />
                </div>

                {/* Các lựa chọn */}
                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Các lựa chọn:
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={{ marginBottom: 5 }}>
                      <input
                        type="text"
                        placeholder={`Lựa chọn ${String.fromCharCode(
                          65 + optionIndex
                        )}`}
                        value={option}
                        onChange={(e) =>
                          updateQuestionOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        style={{
                          width: "98%",
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #ccc",
                        }}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Đáp án đúng */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      fontWeight: "600",
                    }}
                  >
                    Đáp án đúng:
                  </label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        "correct_answer",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: 6,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                    required
                  >
                    <option value="">Chọn đáp án đúng</option>
                    {question.options.map(
                      (option, optionIndex) =>
                        option && (
                          <option key={optionIndex} value={option}>
                            {String.fromCharCode(65 + optionIndex)}: {option}
                          </option>
                        )
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                borderRadius: 20,
                border: "none",
                backgroundColor: "#F56416",
                color: "white",
                fontWeight: "600",
              }}
            >
              {editingQuiz ? "Cập nhật bài tập" : "Tạo bài tập"}
            </button>
            {editingQuiz && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  borderRadius: 20,
                  border: "1px solid #F56416",
                  backgroundColor: "transparent",
                  color: "#F56416",
                  fontWeight: "600",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* Danh sách bài tập */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Danh sách bài tập ({quizzes.length})</h3>

        {quizzes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: 20 }}>
            Chưa có bài tập nào. Hãy thêm bài tập đầu tiên!
          </p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                border: "1px solid #ccc",
                padding: 20,
                marginBottom: 15,
                borderRadius: 15,
                boxShadow: "0 4px 8px rgba(251, 133, 0, 0.2)",
                background: "white",
              }}
            >
              <h4
                style={{
                  color: "#1e293b",
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 5,
                  marginTop: 0,
                }}
              >
                {quiz.title}
              </h4>
              <p style={{ marginBottom: 10, color: "#666" }}>
                {quiz.description}
              </p>
              <small style={{ color: "#999" }}>
                Ngày tạo: {new Date(quiz.created_at).toLocaleDateString()} | Số
                câu hỏi: {quiz.questions ? quiz.questions.length : 0} |
                <span
                  onClick={() => handleShowPopup(quiz)}
                  style={{
                    cursor: "pointer",
                    color: "#E28413",
                    fontWeight: "600",
                    marginLeft: "5px",
                  }}
                >
                  Đã làm: {quiz.completed_count}
                </span>
                {/* Popup hiển thị danh sách học sinh */}
                {showStudentPopup && selectedQuiz && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000,
                    }}
                    onClick={handleClosePopup}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "24px",
                        borderRadius: "12px",
                        width: "500px",
                        maxWidth: "90vw",
                        maxHeight: "80vh",
                        overflow: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                          borderBottom: "1px solid #e2e8f0",
                          paddingBottom: "12px",
                        }}
                      >
                        <h3 style={{ margin: 0, color: "#E28413" }}>
                          Danh sách số học sinh đã làm {selectedQuiz.title}
                        </h3>
                        <button
                          onClick={handleClosePopup}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "18px",
                            cursor: "pointer",
                            color: "#666",
                          }}
                        >
                          x
                        </button>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ margin: "0 0 8px 0", color: "black" }}>
                          Tổng số học sinh: {studentResults.length}
                        </p>
                      </div>

                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {studentResults.length > 0 ? (
                          studentResults.map((student, index) => (
                            <div
                              key={index}
                              style={{
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                marginBottom: "8px",
                                background: "#f8fafc",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "5px",
                                  color: "#E28413"
                                }}
                              >
                                {student.name}
                              </div>
                              <div style={{ fontSize: "14px", color: "black" }}>
                                Điểm: {student.score} | Thời gian:{" "}
                                {new Date(
                                  student.completed_at
                                ).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              textAlign: "center",
                              color: "black",
                              padding: "20px",
                            }}
                          >
                            Chưa có học sinh nào làm bài này
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={handleClosePopup}
                          style={{
                            padding: "8px 16px",
                            background: "#64748b",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#E28413";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#64748b";
                          }}
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </small>

              {/* Hiển thị câu hỏi */}
              {quiz.questions && quiz.questions.length > 0 && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 15,
                    background: "#f8f9fa",
                    borderRadius: 10,
                  }}
                >
                  <h5 style={{ margin: "0 0 10px 0" }}>Câu hỏi trong bài:</h5>
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        background: "white",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                      }}
                    >
                      <div style={{ fontWeight: "600", marginBottom: 5 }}>
                        Câu {index + 1}: {question.question_text}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        Đáp án đúng: <strong>{question.correct_answer}</strong>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteQuestion(quiz.id, question.id)
                        }
                        style={{
                          marginTop: 5,
                          padding: "2px 8px",
                          cursor: "pointer",
                          borderRadius: 10,
                          border: "none",
                          backgroundColor: "#ff6b6b",
                          color: "white",
                          fontSize: "10px",
                        }}
                      >
                        Xóa câu hỏi
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút quản lý */}
              <div
                style={{
                  marginTop: 15,
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => startEditQuiz(quiz)}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    borderRadius: 15,
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Sửa bài tập
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    borderRadius: 15,
                    border: "none",
                    backgroundColor: "#dc3545",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Xóa bài tập
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPage;

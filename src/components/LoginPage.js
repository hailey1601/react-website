import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        console.log("Backend connected successfully");
        setBackendStatus("connected");
      } else {
        setBackendStatus("error");
      }
    } catch (err) {
      console.error("Backend connection error:", err);
      setBackendStatus("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", res.status);

      const data = await res.json();
      console.log("Login response data:", data);

      if (!res.ok) {
        throw new Error(data.error || `Lỗi server: ${res.status}`);
      }

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          padding: "40px 35px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #E28413 0%, #DD4B1A 100%)",
            borderRadius: "50%",
            opacity: "0.1",
          }}
        ></div>

        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            opacity: "0.1",
          }}
        ></div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              margin: "0 0 8px 0",
              color: "#1e293b",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            Đăng nhập
          </h2>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Đăng nhập để tiếp tục học tập
          </p>
        </div>

        {/* Backend Status */}
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: backendStatus === "connected" ? "#f0fdf4" : "#fef2f2",
            border:
              backendStatus === "connected"
                ? "1px solid #bbf7d0"
                : "1px solid #fecaca",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          <strong>Trạng thái kết nối: </strong>
          {backendStatus === "checking" && "🔄 Đang kiểm tra kết nối..."}
          {backendStatus === "connected" && "✅ Đã kết nối đến backend"}
          {backendStatus === "error" && "❌ Không thể kết nối đến backend"}
        </div>

        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fef2f2",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #fecaca",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
                background: "#fafafa",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#E28413";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(226, 132, 19, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.background = "#fafafa";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
                background: "#fafafa",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#E28413";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(226, 132, 19, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.background = "#fafafa";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || backendStatus === "error"}
            style={{
              width: "100%",
              padding: "16px",
              background:
                isLoading || backendStatus === "error"
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #E28413 0%, #DD4B1A 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              cursor:
                isLoading || backendStatus === "error"
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow:
                isLoading || backendStatus === "error"
                  ? "none"
                  : "0 4px 15px rgba(226, 132, 19, 0.3)",
              marginBottom: "24px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && backendStatus !== "error") {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(226, 132, 19, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && backendStatus !== "error") {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(226, 132, 19, 0.3)";
              }
            }}
          >
            {isLoading ? (
              <span>⏳ Đang đăng nhập...</span>
            ) : (
              <span>🔑 Đăng nhập</span>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              style={{
                color: "#E28413",
                textDecoration: "none",
                fontWeight: "600",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#DD4B1A";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#E28413";
              }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

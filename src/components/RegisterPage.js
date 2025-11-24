import React, { useState } from "react";
import { Link } from "react-router-dom";

function RegisterPage({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "/login";
      } else {
        setError(data.error || "Lỗi đăng ký!");
      }
    } catch (err) {
      setError("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
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
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          padding: "40px 35px",
          position: "relative",
          overflow: "hidden",
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
            Đăng ký tài khoản
          </h2>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Tạo tài khoản để bắt đầu học tập
          </p>
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

        <form onSubmit={handleRegister}>
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
              Loại tài khoản:
            </label>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "user" })}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background:
                    formData.role === "user"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#f1f5f9",
                  color: formData.role === "user" ? "white" : "#64748b",
                  border:
                    formData.role === "user"
                      ? "2px solid #667eea"
                      : "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    formData.role === "user"
                      ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (formData.role !== "user") {
                    e.target.style.background = "#e2e8f0";
                    e.target.style.borderColor = "#cbd5e1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.role !== "user") {
                    e.target.style.background = "#f1f5f9";
                    e.target.style.borderColor = "#e2e8f0";
                  }
                }}
              >
                👤 User
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background:
                    formData.role === "admin"
                      ? "linear-gradient(135deg, #E28413 0%, #DD4B1A 100%)"
                      : "#f1f5f9",
                  color: formData.role === "admin" ? "white" : "#64748b",
                  border:
                    formData.role === "admin"
                      ? "2px solid #E28413"
                      : "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    formData.role === "admin"
                      ? "0 4px 12px rgba(226, 132, 19, 0.3)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (formData.role !== "admin") {
                    e.target.style.background = "#e2e8f0";
                    e.target.style.borderColor = "#cbd5e1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.role !== "admin") {
                    e.target.style.background = "#f1f5f9";
                    e.target.style.borderColor = "#e2e8f0";
                  }
                }}
              >
                👑 Admin
              </button>
            </div>
          </div>

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
              Họ và tên:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên của bạn"
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
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              Mật khẩu:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu"
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
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading
                ? "#cbd5e1"
                : "linear-gradient(135deg, #E28413 0%, #DD4B1A 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: loading
                ? "none"
                : "0 4px 15px rgba(226, 132, 19, 0.3)",
              marginBottom: "24px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(226, 132, 19, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(226, 132, 19, 0.3)";
              }
            }}
          >
            {loading ? (
              <span>⏳ Đang đăng ký...</span>
            ) : (
              <span>🚀 Đăng ký tài khoản</span>
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
            Đã có tài khoản?{" "}
            <Link
              to="/login"
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
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

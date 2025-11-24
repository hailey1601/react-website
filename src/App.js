import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import AdminPage from "./components/AdminPage";
import UserHome from "./components/UserHome";
import QuizPage from "./components/QuizPage";
import ResultsPage from "./components/ResultsPage";
import Chatbot from "./components/ChatBot";
import RegisterPage from "./components/RegisterPage";

// Sidebar Component
function Sidebar({ user, logout, currentPath }) {
  const menuItems = [
    { path: "/", label: "Trang chủ", roles: ["user", "admin"] },
    { path: "/admin", label: "Quản lý", roles: ["admin"] },
    { path: "/results", label: "Kết quả", roles: ["user", "admin"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div
      style={{
        width: "250px",
        background: "#E28413",
        color: "black",
        height: "100vh",
        padding: "20px 0",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: "600",
          }}
        >
          Assignment App
        </h2>
      </div>

      {/* Menu Items */}
      <nav>
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "block",
              padding: "12px 20px",
              color: currentPath === item.path ? "white" : "black",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: currentPath === item.path ? "600" : "400",
              background: currentPath === item.path ? "#DD4B1A" : "transparent",
              borderLeft:
                currentPath === item.path ? "2px solid white" : "none",
              transition: "all 0.3s ease",
              margin: "5px 10px",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              if (currentPath !== item.path) {
                e.target.style.background = "transparent";
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* LogOut */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "0",
          right: "0",
          padding: "0 20px",
        }}
      >
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            color: "black",
            background: "transparent",
            border: "none",
            fontWeight: "600",
            fontSize: 18,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#DD4B1A";
            e.target.style.border = "none";
            e.target.style.color = "white";
            e.target.style.borderRadius = "20px";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "black";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

// Main Layout Component
function MainLayout({ user, logout, children }) {
  const location = useLocation();

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar user={user} logout={logout} currentPath={location.pathname} />

      {/* Main Content */}
      <div
        style={{
          marginLeft: "250px",
          flex: 1,
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "white",
            padding: "1rem 2rem",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                color: "#1e293b",
              }}
            >
              {location.pathname === "/" && "Dashboard"}
              {location.pathname === "/admin" && "Quản Lý Bài Tập"}
              {location.pathname === "/results" && "Kết Quả Học Tập"}
              {location.pathname.startsWith("/quiz/") && "Làm Bài Tập"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "600", color: "#1e293b" }}>
                {user.name}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  background: user.role === "admin" ? "#ffb703" : "#667eea",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  marginTop: "2px",
                  textAlign: "center",
                }}
              >
                {user.role === "admin" ? "Admin" : "User"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "2rem" }}>{children}</main>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <div>
        {user ? (
          <>
            <MainLayout user={user} logout={logout}>
              <Routes>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/quiz/:id" element={<QuizPage user={user} />} />
                <Route path="/results" element={<ResultsPage user={user} />} />
                <Route path="/" element={<UserHome user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainLayout>
            <Chatbot user={user} />
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route
              path="/register"
              element={<RegisterPage setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;

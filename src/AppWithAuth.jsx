import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import App from "./App";
import Login from "./components/Login";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      const loginTime = localStorage.getItem("loginTime");
      const storedUsername = localStorage.getItem("username");

      if (loginStatus === "true" && loginTime && storedUsername) {
        // Check if login is still valid (24 hours)
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (now - loginTimestamp < twentyFourHours) {
          setIsLoggedIn(true);
        } else {
          // Login expired, clear storage
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("loginTime");
          localStorage.removeItem("username");
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2 text-muted">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

// Login Page Component
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already logged in
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (loginStatus === "true" && loginTime) {
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - loginTimestamp < twentyFourHours) {
        // Already logged in, redirect to main
        navigate("/main", { replace: true });
      }
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    // Redirect to main page after successful login
    const from = location.state?.from?.pathname || "/main";
    navigate(from, { replace: true });
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

// Main Dashboard Component
const MainPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "User");
  }, []);

  const handleLogout = () => {
    // Clear all login data from localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("username");

    // Redirect to login page
    navigate("/", { replace: true });
  };

  return <App onLogout={handleLogout} username={username} />;
};

const AppWithAuth = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route - Root path */}
        <Route path="/" element={<LoginPage />} />

        {/* Main Dashboard Route - Protected */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect any other routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppWithAuth;

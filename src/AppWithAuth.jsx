import React, { useState, useEffect } from "react";
import App from "./App";
import Login from "./components/Login";

const AppWithAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
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
          setUsername(storedUsername);
        } else {
          // Login expired, clear storage
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleLoginSuccess = () => {
    const storedUsername = localStorage.getItem("username");
    setIsLoggedIn(true);
    setUsername(storedUsername || "User");
  };

  const handleLogout = () => {
    // Clear all login data from localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("username");

    // Update state
    setIsLoggedIn(false);
    setUsername("");
  };

  // Show loading spinner while checking authentication
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

  // Show Login component if not logged in
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main App with logout functionality if logged in
  return <App onLogout={handleLogout} username={username} />;
};

export default AppWithAuth;

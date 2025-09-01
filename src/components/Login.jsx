import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://hotelmapping.innovatedemo.com/api/v1.0/auth/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `username=${encodeURIComponent(
            username
          )}&password=${encodeURIComponent(password)}`,
        }
      );

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("tokenType", data.token_type || "Bearer");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("username", username);

        onLoginSuccess();
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex position-relative"
      style={{
        background: "#0f0f23",
        overflow: "hidden",
      }}
    >
      {/* Animated Grid Background */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gridMove 20s linear infinite",
        }}
      ></div>

      {/* Glowing Orbs */}
      <div className="position-absolute w-100 h-100">
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)",
            top: "-200px",
            right: "-200px",
            animation: "pulse 4s ease-in-out infinite",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(255, 0, 150, 0.1) 0%, transparent 70%)",
            bottom: "-150px",
            left: "-150px",
            animation: "pulse 6s ease-in-out infinite reverse",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(0, 150, 255, 0.1) 0%, transparent 70%)",
            top: "30%",
            left: "20%",
            animation: "pulse 8s ease-in-out infinite",
          }}
        ></div>
      </div>

      {/* Left Side - Branding */}
      <div className="col-lg-7 d-none d-lg-flex align-items-center justify-content-center position-relative">
        <div className="text-center text-white px-5">
          <div className="mb-5">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-4"
              style={{
                width: "120px",
                height: "120px",
                background: "linear-gradient(135deg, #00ffff 0%, #ff0096 100%)",
                borderRadius: "30px",
                boxShadow: "0 20px 60px rgba(0, 255, 255, 0.3)",
                animation: "logoFloat 3s ease-in-out infinite",
              }}
            >
              <i
                className="fas fa-hotel"
                style={{ fontSize: "3rem", color: "#0f0f23" }}
              ></i>
            </div>
            <h1
              className="display-4 fw-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #00ffff 0%, #ff0096 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hotel Push Dashboard
            </h1>
            <p
              className="lead mb-5"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Advanced hotel management system with real-time analytics and
              seamless integration
            </p>
          </div>

          {/* Feature Cards */}
          <div className="row g-4">
            <div className="col-md-4">
              <div
                className="p-4 rounded-4 h-100"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <i
                  className="fas fa-chart-line mb-3 text-info"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="text-white mb-2">Real-time Analytics</h6>
                <small style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Monitor performance metrics instantly
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="p-4 rounded-4 h-100"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <i
                  className="fas fa-shield-alt mb-3 text-success"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="text-white mb-2">Secure Platform</h6>
                <small style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Enterprise-grade security protocols
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="p-4 rounded-4 h-100"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <i
                  className="fas fa-sync-alt mb-3 text-warning"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="text-white mb-2">Auto Sync</h6>
                <small style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Seamless data synchronization
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="col-lg-5 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card
            className="border-0"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-5">
                <h3 className="text-white fw-bold mb-2">Login Section</h3>
                <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Sign in to continue to your dashboard
                </p>
                <div
                  className="mx-auto mt-3"
                  style={{
                    width: "60px",
                    height: "3px",
                    background:
                      "linear-gradient(135deg, #00ffff 0%, #ff0096 100%)",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert
                  className="border-0 mb-4"
                  style={{
                    borderRadius: "16px",
                    background: "rgba(255, 71, 87, 0.1)",
                    color: "#ff4757",
                    border: "1px solid rgba(255, 71, 87, 0.2)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                  </div>
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="border-0 py-4 ps-5 pe-4 text-white"
                      style={{
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.05)",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      onFocus={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.borderColor = "#00ffff";
                        e.target.style.boxShadow =
                          "0 0 20px rgba(0, 255, 255, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.05)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <i
                      className="fas fa-user position-absolute top-50 start-0 translate-middle-y ms-4"
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    ></i>
                  </div>
                </Form.Group>

                <Form.Group className="mb-5">
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-0 py-4 ps-5 pe-5 text-white"
                      style={{
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.05)",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      onFocus={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.borderColor = "#00ffff";
                        e.target.style.boxShadow =
                          "0 0 20px rgba(0, 255, 255, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.05)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <i
                      className="fas fa-lock position-absolute top-50 start-0 translate-middle-y ms-4"
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    ></i>
                    <Button
                      variant="outline-light"
                      className="position-absolute top-50 end-0 translate-middle-y me-3 p-2"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.9rem",
                        zIndex: 10,
                        minWidth: "35px",
                        minHeight: "35px",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#00ffff";
                        e.target.style.borderColor = "#00ffff";
                        e.target.style.backgroundColor =
                          "rgba(0, 255, 255, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "rgba(255, 255, 255, 0.8)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                        style={{ fontSize: "1rem" }}
                      ></i>
                      {/* Fallback text if FontAwesome doesn't load */}
                      <span className="d-none">
                        {showPassword ? "Hide" : "Show"}
                      </span>
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-4 border-0 fw-bold text-dark"
                  disabled={loading || !username || !password}
                  style={{
                    borderRadius: "16px",
                    background: loading
                      ? "rgba(255, 255, 255, 0.3)"
                      : "linear-gradient(135deg, #00ffff 0%, #ff0096 100%)",
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 10px 30px rgba(0, 255, 255, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && username && password) {
                      e.target.style.transform = "translateY(-3px)";
                      e.target.style.boxShadow =
                        "0 15px 40px rgba(0, 255, 255, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 10px 30px rgba(0, 255, 255, 0.3)";
                  }}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-arrow-right me-2"></i>
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </Form>

              {/* Footer */}
              <div className="text-center mt-4">
                <small style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                  <i className="fas fa-lock me-1"></i>
                  Your connection is secured with SSL encryption
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        /* Fallback for FontAwesome icons */
        .fas.fa-eye::before {
          content: "👁️";
          font-family: inherit;
        }

        .fas.fa-eye-slash::before {
          content: "🙈";
          font-family: inherit;
        }

        .fas.fa-lock::before {
          content: "🔒";
          font-family: inherit;
        }

        .fas.fa-user::before {
          content: "👤";
          font-family: inherit;
        }

        /* Ensure eye button is always visible */
        .position-absolute.top-50.end-0 {
          z-index: 1000 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
};

export default Login;

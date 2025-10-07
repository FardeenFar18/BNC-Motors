import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosauth";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage({ text: "Please fill in all fields.", type: "danger" });
      return;
    }

    try {
      const res = await api.post("/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage({ text: "Login successful! Redirecting...", type: "success" });

      /************Redirect to Dashboard after successful login*************/
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage({
          text: "Invalid credentials. Please enter correct email and password.",
          type: "danger",
        });
      } else {
        setMessage({
          text: err.response?.data?.error || "Login failed. Try again.",
          type: "danger",
        });
      }
    }
  };

  if (isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <h2>You are already logged in</h2>
        <Link to="/dashboard" className="btn btn-outline-primary mt-3">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #2279CC, #AD2B72)",
        margin: 0,
        padding: 0,
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={8} md={6} lg={4}>
          <Card
            className="shadow-lg border-0 rounded-4"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Welcome Back</h3>
                <p className="text-muted">Login to your account</p>
              </div>

              {message.text && (
                <Alert
                  variant={message.type}
                  className="py-2 text-center fw-semibold"
                >
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!email && message.type === "danger"}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your email.
                  </Form.Control.Feedback>
                </Form.Group>

                {/*  Password Input with Visibility Toggle */}
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isInvalid={!password && message.type === "danger"}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="d-flex align-items-center"
                      style={{ borderLeft: "none" }}
                    >
                      {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      Please enter your password.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 rounded-pill shadow-sm"
                >
                  Login
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0 text-muted">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-decoration-none text-primary fw-semibold"
                  >
                    Signup here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

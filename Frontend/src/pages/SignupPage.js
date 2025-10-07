import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please re-enter password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({ text: "Please fill all required fields correctly.", type: "danger" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/signup", { name, email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage({ text: "Signup successful! Redirecting...", type: "success" });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Signup failed. Try again.",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  /*****Clears specific field errors + removes message while typing************/
  const handleInputChange = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setMessage({ text: "", type: "" });

    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2279CC, #AD2B72)",
      }}
    >
      <Container className="d-flex justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col xs={11} sm={8} md={6} lg={5}>
            <Card
              className="shadow-lg border-0 rounded-4"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Card.Body className="p-5">

                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary">Create Account</h3>
                  <p className="text-muted">Join us and start exploring</p>
                </div>

                {/* Top Red/Green Message */}
                {message.text && (
                  <Alert
                    variant={message.type}
                    className="py-2 text-center fw-semibold mb-4 shadow-sm rounded-3"
                  >
                    {message.text}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            isInvalid={!!errors.password}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            className="d-flex align-items-center"
                            style={{ borderLeft: "none" }}
                            type="button"
                          >
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label>Re-enter Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            isInvalid={!!errors.confirmPassword}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="d-flex align-items-center"
                            style={{ borderLeft: "none" }}
                            type="button"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashFill />
                            ) : (
                              <EyeFill />
                            )}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-3 rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Signup"}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="mb-0 text-muted">
                    Already have an account?{" "}
                    <NavLink
                      to="/login"
                      className="text-decoration-none text-primary fw-semibold"
                    >
                      Login
                    </NavLink>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

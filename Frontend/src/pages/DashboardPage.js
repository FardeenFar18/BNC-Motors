import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosauth";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    vehicles: 0,
    services: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        /*****Example API calls — change endpoints to your backend routes****/
        const [vehicleRes, serviceRes] = await Promise.all([
          api.get("/vehicles/count"),
          api.get("/services/count"),
        ]);

        setStats({
          vehicles: vehicleRes.data.count || 0,
          services: serviceRes.data.count || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchData();
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear(); // clear all keys if needed
    navigate("/login");
  };

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #2279CC, #AD2B72)",
        color: "#fff",
        position: "relative",
      }}
    >
      {/*  Logout Button in top-right corner */}
      <Button
        variant="outline-light"
        className="position-absolute top-0 end-0 m-3 px-3 py-1 fw-semibold"
        onClick={handleLogout}
      >
        Logout
      </Button>

      <Card
        className="p-4 rounded-4 shadow-lg text-center"
        style={{
          background: "rgba(255,255,255,0.9)",
          width: "90%",
          maxWidth: "600px",
        }}
      >
        <h3 className="fw-bold text-primary mb-3">Dashboard Overview</h3>
        <p className="text-muted mb-4">
          Welcome back! Choose what you want to manage below.
        </p>

        {/* <Row className="mb-4">
          <Col xs={6}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body>
                <h5 className="fw-bold text-dark mb-2">Vehicles</h5>
                <h2 className="fw-bold text-primary">{stats.vehicles}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body>
                <h5 className="fw-bold text-dark mb-2">Services</h5>
                <h2 className="fw-bold text-success">{stats.services}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row> */}

        <Row>
          <Col xs={12} md={6} className="mb-2">
            <Link to="/vehicles">
              <Button variant="primary" className="w-100 rounded-pill">
                Go to Vehicles
              </Button>
            </Link>
          </Col>
          <Col xs={12} md={6}>
            <Link to="/services">
              <Button variant="outline-primary" className="w-100 rounded-pill">
                Go to Services
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../api/axiosauth";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function DashboardPage() {
  const [stats, setStats] = useState({ vehicles: 0, services: 0 });
  const [vehicles, setVehicles] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [vehicleRes, serviceRes] = await Promise.all([
          api.get("/vehicles/count"),
          api.get("/services/count"),
        ]);

        setStats({
          vehicles: vehicleRes.data.count || 0,
          services: serviceRes.data.count || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      }
    };

    const fetchVehicleData = async () => {
      try {
        const response = await fetch("/data/vehicles.json");
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Error loading vehicle data:", error);
      }
    };

    fetchDashboardData();
    fetchVehicleData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center py-5"
      style={{
        background: "linear-gradient(135deg, #2279CC, #AD2B72)",
        minHeight: "100vh",
        color: "#fff",
        position: "relative",
      }}
    >
 
      <Button
        variant="outline-light"
        className="position-absolute top-0 end-0 m-3 px-3 py-1 fw-semibold"
        onClick={handleLogout}
      >
        Logout
      </Button>


      <Card
        className="p-4 rounded-4 shadow-lg text-center mb-4"
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

 
      <div
        className="shadow-lg rounded-4 overflow-hidden"
        style={{
          width: "90%",
          maxWidth: "900px",
          height: "400px",
          background: "#fff",
        }}
      >
        <MapContainer
          center={[11.9361, 79.5]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

       {vehicles.map((v) => (
  <Marker key={v.id} position={[v.lat, v.lng]}>
    <Popup>
      <strong>{v.name}</strong> <br />
      VIN: {v.vin} <br />
      Reg No: {v.registration} <br />
      Status:{" "}
      <span style={{ color: v.status === "active" ? "green" : "red" }}>
        {v.status.toUpperCase()}
      </span>
      <br />
      Lat: {v.lat}, Lng: {v.lng}
    </Popup>
  </Marker>
))}

        </MapContainer>
      </div>
    </Container>
  );
}

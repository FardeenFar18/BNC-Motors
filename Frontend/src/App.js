import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import VehiclePage from "./pages/VehiclePage";
import ServicePage from "./pages/ServicePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import VehicleList from "./components/Vechicle/VehicleList";
import ServiceList from "./components/Service/ServiceList";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div>
      {/* <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {isLoggedIn ? (
          <>
            <Link to="/vehicles">Vehicles</Link>
            <Link to="/services">Services</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            
          </>
        )}
      </nav> */}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/VehicleList" element={<VehicleList />} />
                                <Route path="/ServiceList" element={<ServiceList />} />



        



        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <VehiclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicePage />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

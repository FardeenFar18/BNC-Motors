import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Table,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { Search } from "react-bootstrap-icons";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      if (Array.isArray(res.data.data)) {
        setVehicles(res.data.data);
        setFilteredVehicles(res.data.data);
      } else {
        setError("Invalid data format received");
      }
    } catch (err) {
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter((v) =>
        Object.values(v)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
  }, [search, vehicles]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Vehicle?",
      text: "This vehicle record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2279CC",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/vehicles/${id}`);
        const updated = vehicles.filter((v) => v._id !== id);
        setVehicles(updated);
        setFilteredVehicles(updated);
        Swal.fire("Deleted!", "Vehicle removed successfully.", "success");
      } catch {
        Swal.fire("Error", "Failed to delete vehicle.", "error");
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ ...vehicle });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

 const validateForm = () => {
  const required = [
    "vin",
    "registrationNumber",
    "make",
    "model",
    "year",
    "color",
    "ownerName",
    "ownerContact",
    "status",
  ];

  const errors = {};

  required.forEach((f) => {
    const value = formData[f];
    
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      errors[f] = "This field is required.";
    }
  });

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await api.put(`/vehicles/${editingVehicle._id}`, formData);
      const updated = vehicles.map((v) =>
        v._id === editingVehicle._id ? res.data : v
      );
      setVehicles(updated);
      setFilteredVehicles(updated);
      setEditingVehicle(null);
      Swal.fire("Success", "Vehicle updated successfully!", "success");
    } catch {
      Swal.fire("Error", "Failed to update vehicle.", "error");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-primary bg-gradient bg-opacity-75">
        <Spinner animation="border" variant="light" />
      </div>
    );

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-primary bg-gradient bg-opacity-75">
        <Alert variant="danger" className="text-center shadow">
          {error}
        </Alert>
      </div>
    );

  return (
    <div className="min-vh-100 bg-primary bg-gradient bg-opacity-75 py-5">
      <div className="container bg-light rounded-4 shadow-lg p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary mb-0">
            Vehicle Management
          </h3>
          <InputGroup style={{ width: "300px" }}>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <FormControl
              placeholder="Search vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Vehicle Table */}
        {filteredVehicles.length > 0 ? (
          <div className="table-responsive rounded-4 border shadow-sm bg-white">
            <Table hover bordered className="align-middle mb-0">
              <thead className="table-primary text-center">
                <tr>
                  <th>VIN</th>
                  <th>Registration</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Color</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v._id}>
                    <td>{v.vin}</td>
                    <td>{v.registrationNumber}</td>
                    <td>{v.make}</td>
                    <td>{v.model}</td>
                    <td>{v.year}</td>
                    <td>{v.color}</td>
                    <td>
                      <strong>{v.ownerName}</strong>
                      <br />
                      <small className="text-muted">{v.ownerContact}</small>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          v.status === "Active"
                            ? "bg-success"
                            : v.status === "Inactive"
                            ? "bg-secondary"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td>{v.notes}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="primary"
                        className="me-2 rounded-pill px-3"
                        onClick={() => handleEdit(v)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="rounded-pill px-3"
                        onClick={() => handleDelete(v._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info" className="text-center shadow-sm mt-4">
            No vehicles found.
          </Alert>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        show={!!editingVehicle}
        onHide={() => setEditingVehicle(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary bg-gradient text-white">
          <Modal.Title>Edit Vehicle Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form onSubmit={handleSubmit}>
            <div className="row">
              {[
                { label: "VIN", name: "vin" },
                { label: "Registration Number", name: "registrationNumber" },
                { label: "Make", name: "make" },
                { label: "Model", name: "model" },
                { label: "Year", name: "year" },
                { label: "Color", name: "color" },
                { label: "Owner Name", name: "ownerName" },
                { label: "Owner Contact", name: "ownerContact" },
                { label: "Status", name: "status" },
                { label: "Notes", name: "notes" },
              ].map((f, i) => (
                <div className="col-md-6 mb-3" key={i}>
                  <Form.Group>
                    <Form.Label>{f.label}</Form.Label>
                    <Form.Control
                      type="text"
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      isInvalid={!!formErrors[f.name]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors[f.name]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end pt-3">
              <Button
                variant="secondary"
                className="me-2 rounded-pill px-4"
                onClick={() => setEditingVehicle(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="rounded-pill px-4">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

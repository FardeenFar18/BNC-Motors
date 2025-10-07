import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../../api/axios";
import { Container, Row, Col, Card, Form, Button, Alert, NavLink } from "react-bootstrap";

export default function VehicleForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vin: "",
    registrationNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
    ownerName: "",
    ownerContact: "",
    status: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const requiredFields = ["vin", "registrationNumber", "make", "model"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!form[field] || form[field].trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    if (form.year && !/^\d{4}$/.test(form.year)) {
      newErrors.year = "Enter a valid 4-digit year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await api.post("/vehicles", form);
      setSuccess(true);
      setForm({
        vin: "",
        registrationNumber: "",
        make: "",
        model: "",
        year: "",
        color: "",
        ownerName: "",
        ownerContact: "",
        status: "inactive",
        notes: "",
      });
      setErrors({});
    } catch (err) {
      setErrors({ api: err.response?.data?.error || "Failed to add vehicle" });
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/vehicles");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <Container className="my-5">
      <Card className="shadow-lg border-0 rounded-4">
        <div className="bg-primary text-white py-3 rounded-top-4 text-center">
          <h3 className="fw-bold mb-0">Add New Vehicle</h3>
        </div>

        <Card.Body className="bg-light">
          {success && (
            <Alert variant="success" className="text-center">
              Vehicle added successfully <br />
              Redirecting to Vehicle List...
            </Alert>
          )}

          {errors.api && <Alert variant="danger">{errors.api}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">VIN *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vin"
                    value={form.vin}
                    onChange={handleChange}
                    isInvalid={!!errors.vin}
                    placeholder="Enter VIN"
                  />
                  <Form.Control.Feedback type="invalid">{errors.vin}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Registration Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    isInvalid={!!errors.registrationNumber}
                    placeholder="Enter Registration Number"
                  />
                  <Form.Control.Feedback type="invalid">{errors.registrationNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Make *</Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={form.make}
                    onChange={handleChange}
                    isInvalid={!!errors.make}
                    placeholder="Vehicle Make"
                  />
                  <Form.Control.Feedback type="invalid">{errors.make}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Model *</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    isInvalid={!!errors.model}
                    placeholder="Vehicle Model"
                  />
                  <Form.Control.Feedback type="invalid">{errors.model}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    isInvalid={!!errors.year}
                    placeholder="Enter Year"
                  />
                  <Form.Control.Feedback type="invalid">{errors.year}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Color</Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Vehicle Color"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Owner Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Owner Name"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Owner Contact</Form.Label>
                  <Form.Control
                    type="text"
                    name="ownerContact"
                    value={form.ownerContact}
                    onChange={handleChange}
                    placeholder="Owner Contact"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="border-primary"
                  >
                      <option value="" disabled selected>
      Select status
    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional notes"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <Button
                type="submit"
                variant="success"
                className="rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                Add Vehicle
              </Button>
            </div>
        
 <div className="text-center mt-4">
  <Link
    to="/VehicleList"
   
  >
    Vehicle List
  </Link>
</div>


          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

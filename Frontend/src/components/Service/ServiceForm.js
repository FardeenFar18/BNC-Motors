import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Container, Card, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";

export default function ServiceForm() {
  const [form, setForm] = useState({
    vehicleId: "",
    serviceType: "",
    serviceDate: "",
    cost: "",
    description: "",
    mileage: "",
    serviceCenter: "",
    nextServiceDue: "",
    performedBy: "",
    partsUsed: [{ name: "", partNumber: "", cost: "" }],
  });
  const [images, setImages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  // Fetch vehicles
  useEffect(() => {
    api.get("/vehicles")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : res.data;
        setVehicles(data || []);
        setVehiclesLoading(false);
      })
      .catch(() => {
        setApiError("Failed to load vehicles.");
        setVehiclesLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0]; 
  if (!file) return;

 
  if (images.length >= 3) {
    alert("You can only upload up to 3 images.");
    e.target.value = ""; 
    return;
  }

  const base64 = await convertToBase64(file);
  setImages((prev) => [...prev, base64]);
  e.target.value = "";
};

const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });


  const handlePartChange = (index, e) => {
    const updatedParts = [...form.partsUsed];
    updatedParts[index][e.target.name] = e.target.value;
    setForm({ ...form, partsUsed: updatedParts });
  };

  const addPart = () => {
    setForm({ ...form, partsUsed: [...form.partsUsed, { name: "", partNumber: "", cost: "" }] });
  };

  const removePart = (index) => {
    const updatedParts = form.partsUsed.filter((_, i) => i !== index);
    setForm({ ...form, partsUsed: updatedParts });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.vehicleId) newErrors.vehicleId = "Vehicle is required";
    if (!form.serviceType.trim()) newErrors.serviceType = "Service Type is required";
    if (!form.serviceDate) newErrors.serviceDate = "Service Date is required";
    if (form.cost && Number(form.cost) < 0) newErrors.cost = "Cost cannot be negative";
    if (form.mileage && Number(form.mileage) < 0) newErrors.mileage = "Mileage cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  if (!validateForm()) return;

  if (!form.vehicleId) { 
    setErrors({ ...errors, vehicleId: "Vehicle is required" });
    return;
  }

  setLoading(true);

  try {
    // Prepare payload
    const payload = {
      vehicle: form.vehicleId, 
      serviceType: form.serviceType,
      serviceDate: form.serviceDate,
      cost: form.cost ? Number(form.cost) : 0,
      description: form.description,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      serviceCenter: form.serviceCenter,
      nextServiceDue: form.nextServiceDue || null,
      performedBy: form.performedBy,
      partsUsed: form.partsUsed.map(p => ({
        name: p.name,
        partNumber: p.partNumber,
        cost: p.cost ? Number(p.cost) : 0,
      })),
       images,
    };

    // Send to backend
    await api.post("/services", payload);

    // Success
    setSuccess(true);
    setApiError("");

    // Reset form
    setForm({
      vehicleId: "",
      serviceType: "",
      serviceDate: "",
      cost: "",
      description: "",
      mileage: "",
      serviceCenter: "",
      nextServiceDue: "",
      performedBy: "",
      partsUsed: [{ name: "", partNumber: "", cost: "" }],
    });
    setImages([]); // Clear images

    // Optional: reload page after 2s
    setTimeout(() => window.location.reload(), 2000);
  } catch (err) {
    setApiError(err.response?.data?.error || "Failed to add service.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Container className="my-5">
      <Card className="shadow-lg border-0 rounded-4">
        <div className="bg-primary text-white text-center py-3 rounded-top-4">
          <h3 className="fw-bold mb-0">Add New Service</h3>
        </div>

        <Card.Body className="bg-light">
          {success && <Alert variant="success" className="text-center fw-semibold">Service added successfully! Reloading...</Alert>}
          {apiError && <Alert variant="danger" className="text-center fw-semibold">❌ {apiError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Vehicle */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Select Vehicle *</Form.Label>
                  {vehiclesLoading ? (
                    <div className="text-center my-2"><Spinner animation="border" variant="primary" /></div>
                  ) : (
                    <Form.Select name="vehicleId" value={form.vehicleId} onChange={handleChange} isInvalid={!!errors.vehicleId}>
                      <option value="">Select Vehicle</option>
                      {vehicles.map(v => <option key={v._id} value={v._id}>{v.make} {v.model} ({v.registrationNumber})</option>)}
                    </Form.Select>
                  )}
                  <Form.Control.Feedback type="invalid">{errors.vehicleId}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Service Type */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Service Type *</Form.Label>
                  <Form.Control type="text" name="serviceType" value={form.serviceType} onChange={handleChange} isInvalid={!!errors.serviceType} placeholder="Enter Service Type" />
                  <Form.Control.Feedback type="invalid">{errors.serviceType}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Service Date */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Service Date *</Form.Label>
                  <Form.Control type="date" name="serviceDate" value={form.serviceDate} onChange={handleChange} isInvalid={!!errors.serviceDate} />
                  <Form.Control.Feedback type="invalid">{errors.serviceDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Cost */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Cost</Form.Label>
                  <Form.Control type="number" name="cost" value={form.cost} onChange={handleChange} isInvalid={!!errors.cost} placeholder="Enter Cost" />
                  <Form.Control.Feedback type="invalid">{errors.cost}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Mileage */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Mileage</Form.Label>
                  <Form.Control type="number" name="mileage" value={form.mileage} onChange={handleChange} isInvalid={!!errors.mileage} placeholder="Enter Mileage" />
                  <Form.Control.Feedback type="invalid">{errors.mileage}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Service Center */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Service Center</Form.Label>
                  <Form.Control type="text" name="serviceCenter" value={form.serviceCenter} onChange={handleChange} placeholder="Enter Service Center" />
                </Form.Group>
              </Col>

              {/* Next Service Due */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Next Service Due</Form.Label>
                  <Form.Control type="date" name="nextServiceDue" value={form.nextServiceDue} onChange={handleChange} />
                </Form.Group>
              </Col>

              {/* Performed By */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Performed By</Form.Label>
                  <Form.Control type="text" name="performedBy" value={form.performedBy} onChange={handleChange} placeholder="Enter Person Name" />
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} name="description" value={form.description} onChange={handleChange} placeholder="Enter Description or Remarks" />
                </Form.Group>
              </Col>
           {/* Upload Images */}
<Col md={12} className="mb-3">
  <Form.Group>
    <Form.Label className="fw-semibold text-secondary">
      Upload Images (max 3)
    </Form.Label>
    <Form.Control
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
    />

   {/* Preview Section */}
<div className="mt-3 d-flex flex-wrap gap-3">
  {images.map((img, i) => (
    <div key={i} className="position-relative">
      {/* Image */}
      <img
        src={img}
        alt={`preview-${i}`}
        style={{
          width: "90px",
          height: "90px",
          objectFit: "cover",
          borderRadius: "10px",
          border: "2px solid #dee2e6",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}
      />

      {/* Remove (X) Button */}
      <button
        type="button"
        onClick={() => {
          setImages(images.filter((_, index) => index !== i));
        }}
        style={{
          position: "absolute",
          top: "-6px",
          right: "-6px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "22px",
          height: "22px",
          cursor: "pointer",
          fontSize: "14px",
          lineHeight: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }}
      >
        ×
      </button>
    </div>
  ))}
  </div>
  </Form.Group>
  </Col>





              {/* Parts Used */}
              <Col md={12} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Parts Used</Form.Label>
                {form.partsUsed.map((part, index) => (
                  <Row key={index} className="mb-2">
                    <Col md={4}><Form.Control placeholder="Part Name" name="name" value={part.name} onChange={(e) => handlePartChange(index, e)} /></Col>
                    <Col md={4}><Form.Control placeholder="Part Number" name="partNumber" value={part.partNumber} onChange={(e) => handlePartChange(index, e)} /></Col>
                    <Col md={3}><Form.Control type="number" placeholder="Cost" name="cost" value={part.cost} onChange={(e) => handlePartChange(index, e)} /></Col>
                    <Col md={1}><Button variant="danger" onClick={() => removePart(index)}>x</Button></Col>
                  </Row>
                ))}
                <Button variant="secondary" size="sm" onClick={addPart}>Add Part</Button>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <Button type="submit" variant="success" className="rounded-pill px-4 py-2 fw-semibold shadow-sm" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Add Service"}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link to="/ServiceList">View Service List</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

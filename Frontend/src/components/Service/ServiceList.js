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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";


export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);




  /**********Fetch Services************/
  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

 
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((s) =>
        Object.values(s)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [search, services]);

  useEffect(() => {
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles", err);
    }
  };
  fetchVehicles();
}, []);

 
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Service?",
      text: "This service record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2279CC",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/services/${id}`);
        const updated = services.filter((s) => s._id !== id);
        setServices(updated);
        setFilteredServices(updated);
        Swal.fire("Deleted!", "Service removed successfully.", "success");
      } catch {
        Swal.fire("Error", "Failed to delete service.", "error");
      }
    }
  };


const handleDownloadExcel = (images, service) => {
  if (!images || images.length === 0) return;

  const wsData = images.map((img, idx) => ({
    Service: service.serviceType,
    ImageNumber: idx + 1,
    FileName: `${service.serviceType}_Image${idx + 1}.png`,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Service Images");
  XLSX.writeFile(wb, `${service.serviceType}_Images.xlsx`);


  images.forEach((img, idx) => {
    const a = document.createElement("a");
    a.href = img; 
    a.download = `${service.serviceType}_Image${idx + 1}.png`;
    a.click();
  });
};


const handleDownloadPDF = (images, service) => {
  if (!images || images.length === 0) return;

  const doc = new jsPDF();
  doc.text(`${service.serviceType} - Images`, 14, 20);

  images.forEach((img, idx) => {
    const y = 30 + idx * 50;
    doc.addImage(img, "JPEG", 15, y, 60, 40); 
  });

  doc.save(`${service.serviceType}_Images.pdf`);
};



const handlePartChange = (index, e) => {
  const { name, value } = e.target;
  setFormData(prev => {
    const parts = [...(prev.partsUsed || [])];
    parts[index] = { ...parts[index], [name]: value };
    return { ...prev, partsUsed: parts };
  });
};

const removePart = (index) => {
  setFormData(prev => {
    const parts = [...(prev.partsUsed || [])];
    parts.splice(index, 1);
    return { ...prev, partsUsed: parts };
  });
};

const addPart = () => {
  setFormData(prev => ({
    ...prev,
    partsUsed: [...(prev.partsUsed || []), { name: "", partNumber: "", cost: "" }],
  }));
};


  
const handleEdit = (service) => {
  setEditingService(service);
  setFormData({
    vehicleId: service.vehicle?._id || "",
    serviceType: service.serviceType,
    serviceDate: service.serviceDate?.split("T")[0] || "",
    cost: service.cost || 0,
    description: service.description || "",
    mileage: service.mileage || "",
    serviceCenter: service.serviceCenter || "",
    nextServiceDue: service.nextServiceDue?.split("T")[0] || "",
    performedBy: service.performedBy || "",
    partsUsed: service.partsUsed || [{ name: "", partNumber: "", cost: "" }],
  });
  setFormErrors({});
};


  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const validateForm = () => {
    const required = ["serviceType", "cost", "serviceDate"];
    const errors = {};
    required.forEach((f) => {
      if (!formData[f] || formData[f].toString().trim() === "") {
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
      const payload = { ...formData, cost: Number(formData.cost) };
      const res = await api.put(`/services/${editingService._id}`, payload);
      const updated = services.map((s) =>
        s._id === editingService._id ? res.data : s
      );
      setServices(updated);
      setFilteredServices(updated);
      setEditingService(null);
      Swal.fire("Success", "Service updated successfully!", "success");
    } catch {
      Swal.fire("Error", "Failed to update service.", "error");
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary mb-0">Service Management</h3>
          <InputGroup style={{ width: "300px" }}>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <FormControl
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {filteredServices.length > 0 ? (
          <div className="table-responsive rounded-4 border shadow-sm bg-white">
            <Table hover bordered className="align-middle mb-0">
              <thead className="table-primary text-center">
                <tr>
                  <th>Service Type</th>
                  <th>Vehicle</th>
                  <th>Cost (₹)</th>
                  <th>Service Date</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => (
                  <tr key={s._id}>
                    <td>{s.serviceType}</td>
                    <td>
                      {s.vehicle
                        ? `${s.vehicle.make} ${s.vehicle.model}`
                        : "N/A"}
                    </td>
                    <td>{s.cost}</td>
                    <td>{s.serviceDate?.split("T")[0]}</td>
                    <td>{s.description || "-"}</td>
                   <td className="text-center">
  <Button
    size="sm"
    variant="primary"
    className="me-2 rounded-pill px-3"
    onClick={() => handleEdit(s)}
  >
    Edit
  </Button>&nbsp;

<Button
  size="sm"
  variant="info"
  className="me-2 rounded-pill px-3"
  onClick={() => {
    setSelectedService(s);
    setShowDownloadModal(true);
  }}
>
  Download
</Button>


<Modal
  show={showDownloadModal}
  onHide={() => setShowDownloadModal(false)}
  centered
>
  <Modal.Header closeButton className="bg-primary bg-gradient text-white">
    <Modal.Title>Download Options</Modal.Title>
  </Modal.Header>
  <Modal.Body className="bg-light text-center">
    <p className="fw-semibold text-secondary mb-3">
      Choose a format to download service data and images.
    </p>

    <div className="d-flex justify-content-center gap-3">
      <Button
        variant="success"
        onClick={() => {
          handleDownloadExcel(selectedService?.images, selectedService);
          setShowDownloadModal(false);
        }}
      >
        Download Excel
      </Button>
      <Button
        variant="info"
        onClick={() => {
          handleDownloadPDF(selectedService?.images, selectedService);
          setShowDownloadModal(false);
        }}
      >
        Download PDF
      </Button>
    </div>
  </Modal.Body>
</Modal>


  <Button
    size="sm"
    variant="danger"
    className="rounded-pill px-3"
    onClick={() => handleDelete(s._id)}
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
            No services found.
          </Alert>
        )}
      </div>

    
      <Modal
        show={!!editingService}
        onHide={() => setEditingService(null)}
        centered
        size="md"
      >
        <Modal.Header closeButton className="bg-primary bg-gradient text-white">
          <Modal.Title>Edit Service Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
        <Form onSubmit={handleSubmit}>

  <Form.Group className="mb-3">
    <Form.Label>Vehicle</Form.Label>
    <Form.Select name="vehicleId" value={formData.vehicleId} onChange={handleChange} isInvalid={!!formErrors.vehicleId}>
       <option value="" disabled>Select Vehicle</option>
      {vehicles.map(v => (
        <option disabled key={v._id} value={v._id}>{v.make} {v.model} ({v.registrationNumber})</option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">{formErrors.vehicleId}</Form.Control.Feedback>
  </Form.Group>


  <Form.Group className="mb-3">
    <Form.Label>Service Type</Form.Label>
    <Form.Control type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} isInvalid={!!formErrors.serviceType} />
  </Form.Group>

 
  <Form.Group className="mb-3">
    <Form.Label>Service Date</Form.Label>
    <Form.Control type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} isInvalid={!!formErrors.serviceDate} />
  </Form.Group>


  <Form.Group className="mb-3">
    <Form.Label>Cost</Form.Label>
    <Form.Control type="number" name="cost" value={formData.cost} onChange={handleChange} />
  </Form.Group>


  <Form.Group className="mb-3">
    <Form.Label>Mileage</Form.Label>
    <Form.Control type="number" name="mileage" value={formData.mileage} onChange={handleChange} />
  </Form.Group>


  <Form.Group className="mb-3">
    <Form.Label>Remarks</Form.Label>
    <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
  </Form.Group>


  <Form.Group className="mb-3">
    <Form.Label>Service Center</Form.Label>
    <Form.Control type="text" name="serviceCenter" value={formData.serviceCenter} onChange={handleChange} />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Next Service Due</Form.Label>
    <Form.Control type="date" name="nextServiceDue" value={formData.nextServiceDue} onChange={handleChange} />
  </Form.Group>

 
  <Form.Group className="mb-3">
    <Form.Label>Performed By</Form.Label>
    <Form.Control type="text" name="performedBy" value={formData.performedBy} onChange={handleChange} />
  </Form.Group>


  {formData.partsUsed?.map((part, idx) => (
    <div key={idx} className="d-flex mb-2 gap-2">
      <Form.Control placeholder="Part Name" name="name" value={part.name} onChange={(e) => handlePartChange(idx, e)} />
      <Form.Control placeholder="Part Number" name="partNumber" value={part.partNumber} onChange={(e) => handlePartChange(idx, e)} />
      <Form.Control type="number" placeholder="Cost" name="cost" value={part.cost} onChange={(e) => handlePartChange(idx, e)} />
      <Button variant="danger" onClick={() => removePart(idx)}>X</Button>
    </div>
  ))}
  <Button size="sm" onClick={addPart}>Add Part</Button>

  <div className="d-flex justify-content-end pt-3">
    <Button variant="secondary" onClick={() => setEditingService(null)}>Cancel</Button>&nbsp;
    <Button variant="primary" type="submit">Save Changes</Button>
  </div>
  
</Form>

        </Modal.Body>
      </Modal>
      

    </div>
  );
}

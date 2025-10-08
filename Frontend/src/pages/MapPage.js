import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Sample vehicle data
const vehicles = [
  { id: 1, lat: 13.0827, lng: 80.2707, vin: "VIN001", make: "Toyota", model: "Corolla", status: "Active" },
  { id: 2, lat: 11.7387, lng: 78.9609, vin: "VIN002", make: "Honda", model: "Civic", status: "Inactive" },
  { id: 3, lat: 12.9850, lng: 77.6050, vin: "VIN003", make: "Ford", model: "Focus", status: "Active" },
  { id: 4, lat: 12.9650, lng: 77.6100, vin: "VIN004", make: "Hyundai", model: "i20", status: "Active" },
  { id: 5, lat: 12.9750, lng: 77.6200, vin: "VIN005", make: "Mahindra", model: "XUV", status: "Inactive" },
];

export default function VehicleMap() {
  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {vehicles.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]}>
          <Popup>
            <strong>VIN:</strong> {v.vin} <br />
            <strong>Make:</strong> {v.make} <br />
            <strong>Model:</strong> {v.model} <br />
            <strong>Status:</strong> {v.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

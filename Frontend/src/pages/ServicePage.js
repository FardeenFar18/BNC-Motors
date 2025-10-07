import React from "react";
import ServiceForm from "../components/Service/ServiceForm";
import ServiceList from "../components/Service/ServiceList";

export default function ServicePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Services</h2>
      <ServiceForm />
      {/* <ServiceList /> */}
    </div>
  );
}

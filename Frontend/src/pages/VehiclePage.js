import React from "react";
// import VehicleForm from "../components/VehicleForm";
import VehicleList from "../components/Vechicle/VehicleList";
import VehicleForm from "../components/Vechicle/VehicleForm";
// import VehicleList from "../components/VehicleList";

export default function VehiclePage() {
  return (
    <div>
      <h2>Vehicles</h2>
      <VehicleForm />
      {/* <VehicleList /> */}
    </div>
  );
}

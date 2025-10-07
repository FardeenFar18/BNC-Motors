import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vin: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    color: { type: String },
    ownerName: { type: String },
    ownerContact: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "sold", "maintenance"],
      default: "inactive",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);

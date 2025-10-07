import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    serviceDate: { type: Date, required: true },
    serviceType: { type: String, required: true },
    description: { type: String },
    mileage: { type: Number },
    cost: { type: Number, default: 0 },
    partsUsed: [{ name: String, partNumber: String, cost: Number }],
    serviceCenter: { type: String },
    nextServiceDue: { type: Date },
    performedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);

import express from "express";
import {
  getVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleServices,
  addVehicleService,
  sendOtpHandler,
   verifyOtpHandler, 
} from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/", getVehicles);
router.post("/", createVehicle);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

/*************vehicle services***********************/
router.get("/:vehicleId/services", getVehicleServices);
router.post("/:vehicleId/services", addVehicleService);

export default router;

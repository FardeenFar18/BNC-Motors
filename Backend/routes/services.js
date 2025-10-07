import express from "express";
import {
  getService,
  updateService,
  deleteService,
  getAllServices,
  addService,
} from "../controllers/serviceController.js";

const router = express.Router();


router.post("/", addService);


router.get("/", getAllServices);


router.get("/:id", getService);


router.put("/:id", updateService);


router.delete("/:id", deleteService);

export default router;

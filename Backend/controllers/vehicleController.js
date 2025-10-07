import Vehicle from "../models/Vehicle.js";
import Service from "../models/Service.js";

/******************Get all vehicles (with pagination + search)*********************/
export const getVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [
        { registrationNumber: re },
        { vin: re },
        { make: re },
        { model: re },
        { ownerName: re },
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.json({ data: vehicles, total });
  } catch (err) {
    next(err);
  }
};

/********Create a new vehicle**************/
export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

/*******************Get single vehicle******************/
export const getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    next(err); 
  }
};

/***************Update vehicle*******************/
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

/***********Delete vehicle (+ related services)*************/
export const deleteVehicle = async (req, res, next) => {
  try {
    await Service.deleteMany({ vehicle: req.params.id });
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/***********Get services for vehicle**********************/
export const getVehicleServices = async (req, res, next) => {
  try {
    const services = await Service.find({ vehicle: req.params.vehicleId }).sort({
      serviceDate: -1,
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
};

/**************Add service to vehicle***********************/
export const addVehicleService = async (req, res, next) => {
  try {
    const service = new Service({ ...req.body, vehicle: req.body.vehicleId });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};


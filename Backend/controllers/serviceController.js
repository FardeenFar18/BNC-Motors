import Service from "../models/Service.js";

/************Get service by ID***********/
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate("vehicle");
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate("vehicle");
    res.status(200).json(services);
  } catch (err) {
    next(err);
  }
};

/*******Add a new service**********/
export const addService = async (req, res) => {
  try {
    const service = new Service(req.body); 
    await service.save();
    res.status(201).json({ message: "Service added", data: service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*******Update service***********/
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

/*********Delete service***********/
export const deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};


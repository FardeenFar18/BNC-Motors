import Vehicle from "../models/Vehicle.js";
import Service from "../models/Service.js";
import { sendSMSUsingSNS } from "../utils/smsService.js";
import nodemailer from "nodemailer";


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

    
    if (vehicle.ownerMail) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail", 
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: vehicle.ownerMail,
          subject: `Vehicle Registered Successfully: ${vehicle.registrationNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>Hello ${vehicle.ownerName || "Owner"},</h2>
              <p>Your vehicle has been successfully registered in our system.</p>
              
              <h3>Vehicle Details:</h3>
              <table style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Registration Number:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.registrationNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Make & Model:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.make} ${vehicle.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>VIN:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${vehicle.vin || "N/A"}</td>
                </tr>
              </table>

              <p>Thank you,<br/>
              <strong>BNC Motor Team</strong></p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", vehicle.ownerMail);
      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    } else {
      console.log("No owner email found, skipping email.");
    }

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


const otpStore = new Map();

export const sendOtpHandler = async (req, res) => {
  try {
    const { ownerContact } = req.body;

    if (!ownerContact) {
      return res.status(400).json({ error: "Owner contact number is required" });
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

   
    await sendSMSUsingSNS(otp, ownerContact);

    
    otpStore.set(ownerContact, otp);
    setTimeout(() => otpStore.delete(ownerContact), 5 * 60 * 1000);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtpHandler:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOtpHandler = (req, res) => {
  const { ownerContact, otp } = req.body;

  if (!ownerContact || !otp) {
    return res.status(400).json({ error: "Missing contact number or OTP" });
  }

  const storedOtp = otpStore.get(ownerContact);
  if (storedOtp === otp) {
    otpStore.delete(ownerContact); 
    return res.json({ verified: true });
  } else {
    return res.status(400).json({ verified: false, error: "Invalid OTP" });
  }
};

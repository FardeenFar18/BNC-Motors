import Service from "../models/Service.js";
import Vehicle from "../models/Vehicle.js";
import nodemailer from "nodemailer";
import { sendSMSUsingSNS } from "../utils/smsService.js"


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


/******* Add a new service and send email **********/
export const addService = async (req, res) => {
  try {
    const { images, ...otherData } = req.body;

    const service = new Service({ ...otherData, images });
    await service.save();

    const vehicle = await Vehicle.findById(service.vehicle);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    /***************** EMAIL NOTIFICATION *****************/
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
        subject: `Service Completed for ${vehicle.make} ${vehicle.model}`,
        html: `
          <h3>Hello ${vehicle.ownerName || "Customer"},</h3>
          <p>We are pleased to inform you that your vehicle <b>${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})</b> has been successfully serviced at <b>BNC Motors</b>.</p>
          <p><b>Service Type:</b> ${service.serviceType}<br/>
             <b>Cost:</b> ₹${service.cost}<br/>
             <b>Service Date:</b> ${new Date(service.serviceDate).toLocaleDateString()}<br/>
             <b>Next Service Due:</b> ${
               service.nextServiceDue
                 ? new Date(service.nextServiceDue).toLocaleDateString()
                 : "Not specified"
             }
          </p>
          <p>Thank you for choosing <b>BNC Motors</b>. We look forward to serving you again.</p>
          <p>Best regards,<br/>BNC Motors Team</p>
        `,
      };

      if (vehicle.ownerMail) {
        await transporter.sendMail(mailOptions);
        console.log("Email sent to:", vehicle.ownerMail);
      } else {
        console.log("No owner email found, skipping email.");
      }
    } catch (err) {
      console.error("Email sending failed:", err.message);
    }

    /***************** SMS NOTIFICATION *****************/
    try {
      if (vehicle.ownerContact) {
        const smsMessage = `Hello ${vehicle.ownerName || "Customer"}, your vehicle ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber}) has been serviced successfully. Service Type: ${service.serviceType}, Cost: ₹${service.cost}. Thank you for choosing BNC Motors.`;

        await sendSMSUsingSNS(smsMessage, vehicle.ownerContact);
        console.log("SMS sent successfully to:", vehicle.ownerContact);
      } else {
        console.log("No owner contact found, skipping SMS.");
      }
    } catch (err) {
      console.error("SMS sending failed:", err.message);
    }

    /***************** SUCCESS RESPONSE *****************/
    res.status(201).json({
      message: "Service added successfully! Email & SMS notifications sent.",
      data: service,
    });
  } catch (err) {
    console.error("Error adding service:", err);
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


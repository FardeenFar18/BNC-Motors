import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/database.js";
import vehicleRoutes from "./routes/vehicles.js";
import serviceRoutes from "./routes/services.js";
import authRoutes from "./routes/authRoutes.js"
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());


connectDB();


app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);


app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

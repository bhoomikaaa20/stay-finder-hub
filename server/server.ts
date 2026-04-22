import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import hotelRoutes from "./routes/hotelRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import adminRoutes from "./routes/adminRoutes";


import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

// 🔹 Middleware
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// 🔹 MongoDB + Server start
const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
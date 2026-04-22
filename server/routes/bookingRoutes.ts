import express from "express";
import { createBooking, getBookedRooms, getMyBookings, cancelBooking } from "../controllers/bookingController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/counts/:hotelId", getBookedRooms);
router.get("/my", verifyToken, getMyBookings);
router.put("/:id/cancel", verifyToken, cancelBooking);

export default router;
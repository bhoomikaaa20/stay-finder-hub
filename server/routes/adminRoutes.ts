import express from "express";
import {
    getAllBookings,
    updateBookingStatus,
    getHotels,
    createHotel,
    updateHotel,
    deleteHotel,
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
} from "../controllers/adminController";

const router = express.Router();

// bookings
router.get("/bookings", getAllBookings);
router.put("/bookings/:id", updateBookingStatus);

// hotels
router.get("/hotels", getHotels);
router.post("/hotels", createHotel);
router.put("/hotels/:id", updateHotel);
router.delete("/hotels/:id", deleteHotel);

// rooms
router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

export default router;
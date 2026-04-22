import { Request, Response } from "express";
import Booking from "../models/Booking";
import Hotel from "../models/Hotel";
import Room from "../models/Room";


// 🔹 Create booking
export const createBooking = async (req: any, res: Response) => {
    try {
        const booking = await Booking.create({
            ...req.body,
            user: req.user.id,
        });

        res.json(booking);
    } catch {
        res.status(500).json({ message: "Booking failed" });
    }
};

// 🔹 Get booked rooms count
export const getBookedRooms = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.find({
            hotel: req.params.hotelId,
        });

        const counts: any = {};
        bookings.forEach((b) => {
            counts[b.room.toString()] =
                (counts[b.room.toString()] || 0) + 1;
        });

        res.json(counts);
    } catch {
        res.status(500).json({ message: "Error" });
    }
};

// 🔹 Get user bookings (with hotel + room info)
export const getMyBookings = async (req: any, res: Response) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("hotel")
            .populate("room")
            .sort({ check_in: -1 });

        res.json(bookings);
    } catch {
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// 🔹 Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, {
            status: "cancelled",
        });

        res.json({ message: "Cancelled" });
    } catch {
        res.status(500).json({ message: "Cancel failed" });
    }
};
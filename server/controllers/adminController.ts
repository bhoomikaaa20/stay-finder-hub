import { Request, Response } from "express";
import Hotel from "../models/Hotel";
import Room from "../models/Room";
import Booking from "../models/Booking";

// 🔹 ALL BOOKINGS (admin)
export const getAllBookings = async (_: Request, res: Response) => {
    const bookings = await Booking.find()
        .populate("hotel")
        .populate("room")
        .populate("user")
        .sort({ createdAt: -1 });

    res.json(bookings);
};

// 🔹 UPDATE STATUS
export const updateBookingStatus = async (req: Request, res: Response) => {
    await Booking.findByIdAndUpdate(req.params.id, {
        status: req.body.status,
    });
    res.json({ message: "Updated" });
};

// 🔹 HOTELS CRUD
export const getHotels = async (_: Request, res: Response) => {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
};

export const createHotel = async (req: Request, res: Response) => {
    const hotel = await Hotel.create(req.body);
    res.json(hotel);
};

export const updateHotel = async (req: Request, res: Response) => {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hotel);
};

export const deleteHotel = async (req: Request, res: Response) => {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};

// 🔹 ROOMS CRUD
export const getRooms = async (_: Request, res: Response) => {
    const rooms = await Room.find().populate("hotel").sort({ createdAt: -1 });
    res.json(rooms);
};

export const createRoom = async (req: Request, res: Response) => {
    const room = await Room.create(req.body);
    res.json(room);
};

export const updateRoom = async (req: Request, res: Response) => {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
};

export const deleteRoom = async (req: Request, res: Response) => {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};
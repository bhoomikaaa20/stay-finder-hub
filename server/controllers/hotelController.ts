import { Request, Response } from "express";
import Hotel from "../models/Hotel";
import Room from "../models/Room";

// 🔹 Get top 3 featured hotels (by rating)
export const getFeaturedHotels = async (_: Request, res: Response) => {
    try {
        const hotels = await Hotel.find()
            .sort({ rating: -1 })
            .limit(3);

        res.json(hotels);
    } catch {
        res.status(500).json({ message: "Error fetching hotels" });
    }
};

// 🔹 Get all hotels
export const getAllHotels = async (_: Request, res: Response) => {
    try {
        const hotels = await Hotel.find().sort({ rating: -1 });
        res.json(hotels);
    } catch {
        res.status(500).json({ message: "Error fetching hotels" });
    }
};

// 🔹 Get single hotel + rooms
export const getHotelById = async (req: Request, res: Response) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        const rooms = await Room.find({ hotel: req.params.id }).sort({
            price_per_night: 1,
        });

        res.json({ hotel, rooms });
    } catch {
        res.status(500).json({ message: "Error fetching hotel" });
    }
};
import express from "express";
import { getFeaturedHotels, getAllHotels, getHotelById } from "../controllers/hotelController";

const router = express.Router();

router.get("/featured", getFeaturedHotels);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);

export default router;
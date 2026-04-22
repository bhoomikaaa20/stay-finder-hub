import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        description: String,
        image_url: String,

        // ✅ FIXED
        price_min: { type: Number, required: true },
        price_max: { type: Number, required: true },

        rating: { type: Number, default: 0 },
        amenities: [String],
    },
    { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
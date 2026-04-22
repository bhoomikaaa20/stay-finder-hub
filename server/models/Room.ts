import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    room_type: String,
    description: String,
    price_per_night: Number,
    capacity: Number,
    total_rooms: Number,
});

export default mongoose.model("Room", roomSchema);
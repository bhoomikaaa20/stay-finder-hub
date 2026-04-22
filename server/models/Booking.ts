import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    check_in: Date,
    check_out: Date,
    guests: Number,
    total_price: Number,
    status: String,
});

export default mongoose.model("Booking", bookingSchema);
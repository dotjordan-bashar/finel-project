const mongoose = require("mongoose");
const { BOOKING_STATUSES } = require("../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }, // the day the car is returned
    totalPrice: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

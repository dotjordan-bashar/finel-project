const mongoose = require("mongoose");
const {
  CITIES,
  CATEGORIES,
  TRANSMISSIONS,
  FUEL_TYPES,
  CAR_STATUSES,
} = require("../config/constants");

const carSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, required: [true, "Brand is required"], trim: true },
    model: { type: String, required: [true, "Model is required"], trim: true },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    pricePerDay: { type: Number, required: [true, "Price is required"], min: 1 },
    city: { type: String, enum: CITIES, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    transmission: { type: String, enum: TRANSMISSIONS, required: true },
    fuelType: { type: String, enum: FUEL_TYPES, required: true },
    seats: { type: Number, min: 2, max: 15, default: 5 },
    imageUrl: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    // New cars wait for admin approval before customers can see them
    status: { type: String, enum: CAR_STATUSES, default: "pending" },
    // The owner can hide the car temporarily without deleting it
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);

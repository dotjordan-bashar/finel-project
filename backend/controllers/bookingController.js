const Booking = require("../models/Booking");
const Car = require("../models/Car");
const AppError = require("../utils/AppError");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// POST /api/bookings  (customer)
const createBooking = async (req, res) => {
  const { carId, startDate, endDate, notes } = req.body;

  const car = await Car.findById(carId);
  if (!car || car.status !== "approved" || !car.isAvailable) {
    throw new AppError("This car is not available for booking", 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Two bookings overlap when one starts before the other ends
  const overlap = await Booking.findOne({
    car: car._id,
    status: { $in: ["pending", "confirmed"] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (overlap) {
    throw new AppError("This car is already booked for some of these dates", 400);
  }

  const days = Math.ceil((end - start) / DAY_IN_MS);

  const booking = await Booking.create({
    car: car._id,
    customer: req.user._id,
    startDate: start,
    endDate: end,
    totalPrice: days * car.pricePerDay,
    notes,
  });

  res.status(201).json({ booking });
};

// GET /api/bookings/my  (customer) - bookings made by the logged-in customer
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("car", "brand model year city imageUrl pricePerDay");

  res.json({ bookings });
};

// GET /api/bookings/owner  (owner) - bookings on the owner's cars
const getOwnerBookings = async (req, res) => {
  const carIds = await Car.find({ owner: req.user._id }).distinct("_id");

  const bookings = await Booking.find({ car: { $in: carIds } })
    .sort({ createdAt: -1 })
    .populate("car", "brand model year imageUrl")
    .populate("customer", "name email phone");

  res.json({ bookings });
};

// Decide if this user may move the booking to the new status
//  - customer: can cancel their own pending/confirmed booking
//  - owner:    pending -> confirmed / cancelled,  confirmed -> completed / cancelled
//  - admin:    anything
const canChangeStatus = (booking, user, newStatus) => {
  if (user.role === "admin") return true;

  const isCustomer = booking.customer.equals(user._id);
  const isOwner = booking.car.owner.equals(user._id);
  const current = booking.status;

  if (isCustomer && newStatus === "cancelled") {
    return ["pending", "confirmed"].includes(current);
  }
  if (isOwner && current === "pending") {
    return ["confirmed", "cancelled"].includes(newStatus);
  }
  if (isOwner && current === "confirmed") {
    return ["completed", "cancelled"].includes(newStatus);
  }
  return false;
};

// PATCH /api/bookings/:id/status  (customer, owner, admin)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findById(req.params.id).populate("car", "owner");
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (!canChangeStatus(booking, req.user, status)) {
    throw new AppError(`You cannot change this booking to "${status}"`, 403);
  }

  booking.status = status;
  await booking.save();

  res.json({ booking });
};

module.exports = { createBooking, getMyBookings, getOwnerBookings, updateBookingStatus };

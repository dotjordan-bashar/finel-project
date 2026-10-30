const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");
const { getPagination, buildPageInfo, escapeRegex } = require("../utils/queryHelpers");

// GET /api/admin/stats - numbers for the dashboard
const getStats = async (req, res) => {
  const [
    totalUsers,
    customers,
    owners,
    totalCars,
    pendingCars,
    totalBookings,
    pendingBookings,
    revenueResult,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "owner" }),
    Car.countDocuments(),
    Car.countDocuments({ status: "pending" }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    // Add up the price of all confirmed and completed bookings
    Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("car", "brand model")
      .populate("customer", "name"),
  ]);

  res.json({
    users: { total: totalUsers, customers, owners },
    cars: { total: totalCars, pending: pendingCars },
    bookings: { total: totalBookings, pending: pendingBookings },
    revenue: revenueResult[0]?.total || 0,
    recentBookings,
  });
};

// ---------- Users ----------

// GET /api/admin/users?search=&role=&page=
const getUsers = async (req, res) => {
  const { search, role } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (role) filter.role = role;

  const { page, limit, skip } = getPagination(req.query, 10);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, pagination: buildPageInfo(total, page, limit) });
};

// PATCH /api/admin/users/:id - change role or activate / deactivate
const updateUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError("You cannot change your own account here", 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { role, isActive } = req.body;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.json({ user });
};

// DELETE /api/admin/users/:id - also removes their cars and bookings
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const carIds = await Car.find({ owner: user._id }).distinct("_id");
  await Booking.deleteMany({ $or: [{ customer: user._id }, { car: { $in: carIds } }] });
  await Car.deleteMany({ owner: user._id });
  await user.deleteOne();

  res.json({ message: "User deleted" });
};

// ---------- Cars ----------

// GET /api/admin/cars?search=&status=&page=  (all cars, any status)
const getAllCars = async (req, res) => {
  const { search, status } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ brand: regex }, { model: regex }];
  }
  if (status) filter.status = status;

  const { page, limit, skip } = getPagination(req.query, 10);

  const [cars, total] = await Promise.all([
    Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("owner", "name email"),
    Car.countDocuments(filter),
  ]);

  res.json({ cars, pagination: buildPageInfo(total, page, limit) });
};

// PATCH /api/admin/cars/:id/status - approve or reject a car
const updateCarStatus = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    throw new AppError("Car not found", 404);
  }

  car.status = req.body.status;
  await car.save();

  res.json({ car });
};

// ---------- Bookings ----------

// GET /api/admin/bookings?status=&page=
const getAllBookings = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const { page, limit, skip } = getPagination(req.query, 10);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("car", "brand model")
      .populate("customer", "name email"),
    Booking.countDocuments(filter),
  ]);

  res.json({ bookings, pagination: buildPageInfo(total, page, limit) });
};

// DELETE /api/admin/bookings/:id
const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }
  res.json({ message: "Booking deleted" });
};

module.exports = {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllCars,
  updateCarStatus,
  getAllBookings,
  deleteBooking,
};

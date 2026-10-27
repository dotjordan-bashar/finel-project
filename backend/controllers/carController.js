const Car = require("../models/Car");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");
const { getPagination, buildPageInfo, escapeRegex } = require("../utils/queryHelpers");

// Fields a user is allowed to send when creating or editing a car
const CAR_FIELDS = [
  "brand",
  "model",
  "year",
  "pricePerDay",
  "city",
  "category",
  "transmission",
  "fuelType",
  "seats",
  "imageUrl",
  "description",
  "isAvailable",
];

// Copy only the allowed fields from req.body
const pickCarFields = (body) => {
  const data = {};
  CAR_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { pricePerDay: 1 },
  price_desc: { pricePerDay: -1 },
  year_desc: { year: -1 },
};

// Is this user the owner of the car or an admin?
const canManageCar = (car, user) => user.role === "admin" || car.owner.equals(user._id);

// GET /api/cars  (public) - search, filter, sort and paginate approved cars
// Example: /api/cars?search=toyota&city=Amman&minPrice=20&sort=price_asc&page=2
const getCars = async (req, res) => {
  const { search, city, category, transmission, fuelType, minPrice, maxPrice, sort } = req.query;

  const filter = { status: "approved", isAvailable: true };

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ brand: regex }, { model: regex }];
  }
  if (city) filter.city = city;
  if (category) filter.category = category;
  if (transmission) filter.transmission = transmission;
  if (fuelType) filter.fuelType = fuelType;

  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  const { page, limit, skip } = getPagination(req.query);
  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  // Run both queries at the same time
  const [cars, total] = await Promise.all([
    Car.find(filter).sort(sortBy).skip(skip).limit(limit).populate("owner", "name"),
    Car.countDocuments(filter),
  ]);

  res.json({ cars, pagination: buildPageInfo(total, page, limit) });
};

// GET /api/cars/:id  (public, but hidden cars are only visible to their owner or admin)
const getCar = async (req, res) => {
  const car = await Car.findById(req.params.id).populate("owner", "name email phone");

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  const isPublic = car.status === "approved";
  const canSeeHidden =
    req.user && (req.user.role === "admin" || car.owner._id.equals(req.user._id));

  if (!isPublic && !canSeeHidden) {
    throw new AppError("Car not found", 404);
  }

  res.json({ car });
};

// GET /api/cars/mine  (owner) - all cars of the logged-in owner
const getMyCars = async (req, res) => {
  const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ cars });
};

// POST /api/cars  (owner, admin)
const createCar = async (req, res) => {
  const data = pickCarFields(req.body);
  data.owner = req.user._id;
  // Admin cars are approved right away, owner cars wait for review
  data.status = req.user.role === "admin" ? "approved" : "pending";

  const car = await Car.create(data);
  res.status(201).json({ car });
};

// PUT /api/cars/:id  (owner of the car, admin)
const updateCar = async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    throw new AppError("Car not found", 404);
  }
  if (!canManageCar(car, req.user)) {
    throw new AppError("You can only edit your own cars", 403);
  }

  const updates = pickCarFields(req.body);
  Object.assign(car, updates);

  // If an owner changes car details, the admin must review it again.
  // Just switching availability on/off does not need a new review.
  const onlyAvailabilityChanged = Object.keys(updates).every((key) => key === "isAvailable");
  if (req.user.role !== "admin" && !onlyAvailabilityChanged) {
    car.status = "pending";
  }

  await car.save();
  res.json({ car });
};

// DELETE /api/cars/:id  (owner of the car, admin)
const deleteCar = async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    throw new AppError("Car not found", 404);
  }
  if (!canManageCar(car, req.user)) {
    throw new AppError("You can only delete your own cars", 403);
  }

  // Remove the car's bookings too, so no booking points to a missing car
  await Booking.deleteMany({ car: car._id });
  await car.deleteOne();

  res.json({ message: "Car deleted" });
};

module.exports = { getCars, getCar, getMyCars, createCar, updateCar, deleteCar };

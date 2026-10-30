// Fills the database with demo data.  Run with:  npm run seed
// WARNING: this deletes all existing users, cars and bookings first.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Car = require("./models/Car");
const Booking = require("./models/Booking");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Returns a date that is `days` from today (at midnight UTC)
const daysFromToday = (days) => {
  const today = new Date();
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return new Date(date.getTime() + days * DAY_IN_MS);
};

const seed = async () => {
  await connectDB();

  await Booking.deleteMany();
  await Car.deleteMany();
  await User.deleteMany();

  // User.create runs the pre-save hook, so passwords get hashed
  const [, owner1, owner2, customer1, customer2] = await User.create([
    { name: "Site Admin", email: "admin@drivejo.com", password: "admin123", role: "admin" },
    { name: "Omar Haddad", email: "owner@drivejo.com", password: "owner123", role: "owner", phone: "0791234567" },
    { name: "Lina Saleh", email: "owner2@drivejo.com", password: "owner123", role: "owner", phone: "0781234567" },
    { name: "Ahmad Khalil", email: "customer@drivejo.com", password: "customer123", role: "customer", phone: "0771234567" },
    { name: "Sara Nasser", email: "customer2@drivejo.com", password: "customer123", role: "customer" },
  ]);

  const carData = [
    ["Toyota", "Corolla", 2022, 25, "Amman", "Sedan", "Automatic", "Petrol", 5],
    ["Hyundai", "Elantra", 2021, 22, "Amman", "Sedan", "Automatic", "Petrol", 5],
    ["Kia", "Picanto", 2023, 15, "Irbid", "Economy", "Manual", "Petrol", 4],
    ["Toyota", "Land Cruiser", 2022, 90, "Aqaba", "SUV", "Automatic", "Diesel", 7],
    ["Mercedes", "E-Class", 2023, 120, "Amman", "Luxury", "Automatic", "Petrol", 5],
    ["Hyundai", "Tucson", 2022, 45, "Zarqa", "SUV", "Automatic", "Hybrid", 5],
    ["Nissan", "Sunny", 2020, 18, "Madaba", "Economy", "Automatic", "Petrol", 5],
    ["Kia", "Carnival", 2022, 70, "Amman", "Van", "Automatic", "Diesel", 8],
    ["Tesla", "Model 3", 2023, 85, "Amman", "Luxury", "Automatic", "Electric", 5],
    ["Toyota", "Prius", 2021, 30, "Irbid", "Economy", "Automatic", "Hybrid", 5],
    ["Mitsubishi", "Pajero", 2020, 55, "Aqaba", "SUV", "Manual", "Petrol", 7],
    ["BMW", "5 Series", 2022, 110, "Amman", "Luxury", "Automatic", "Petrol", 5],
    ["Hyundai", "H1", 2021, 60, "Jerash", "Van", "Manual", "Diesel", 12],
    ["Kia", "Sportage", 2023, 50, "Salt", "SUV", "Automatic", "Petrol", 5],
    ["Chevrolet", "Spark", 2020, 14, "Karak", "Economy", "Manual", "Petrol", 4],
    ["Honda", "Civic", 2022, 28, "Amman", "Sedan", "Automatic", "Petrol", 5],
  ];

  const cars = await Car.create(
    carData.map(([brand, model, year, pricePerDay, city, category, transmission, fuelType, seats], i) => ({
      owner: i % 2 === 0 ? owner1._id : owner2._id,
      brand,
      model,
      year,
      pricePerDay,
      city,
      category,
      transmission,
      fuelType,
      seats,
      description: `Clean and well-maintained ${brand} ${model}, perfect for trips around ${city}.`,
      // the last two cars wait for admin approval
      status: i >= carData.length - 2 ? "pending" : "approved",
    }))
  );

  await Booking.create([
    { car: cars[0]._id, customer: customer1._id, startDate: daysFromToday(3), endDate: daysFromToday(6), totalPrice: 3 * cars[0].pricePerDay, status: "confirmed" },
    { car: cars[3]._id, customer: customer1._id, startDate: daysFromToday(10), endDate: daysFromToday(12), totalPrice: 2 * cars[3].pricePerDay, status: "pending" },
    { car: cars[4]._id, customer: customer2._id, startDate: daysFromToday(-10), endDate: daysFromToday(-7), totalPrice: 3 * cars[4].pricePerDay, status: "completed" },
    { car: cars[5]._id, customer: customer2._id, startDate: daysFromToday(5), endDate: daysFromToday(9), totalPrice: 4 * cars[5].pricePerDay, status: "pending" },
  ]);

  console.log("Demo data created:");
  console.log("  admin@drivejo.com    / admin123");
  console.log("  owner@drivejo.com    / owner123");
  console.log("  customer@drivejo.com / customer123");

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Shared lists used by the models and the validators

const ROLES = ["customer", "owner", "admin"];

const CITIES = ["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba", "Jerash", "Salt", "Karak"];
const CATEGORIES = ["Economy", "Sedan", "SUV", "Luxury", "Van"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

const CAR_STATUSES = ["pending", "approved", "rejected"];
const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

module.exports = {
  ROLES,
  CITIES,
  CATEGORIES,
  TRANSMISSIONS,
  FUEL_TYPES,
  CAR_STATUSES,
  BOOKING_STATUSES,
};

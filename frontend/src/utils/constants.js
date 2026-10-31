// Same lists as the backend (backend/config/constants.js)
export const CITIES = ["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba", "Jerash", "Salt", "Karak"];
export const CATEGORIES = ["Economy", "Sedan", "SUV", "Luxury", "Van"];
export const TRANSMISSIONS = ["Automatic", "Manual"];
export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
export const ROLES = ["customer", "owner", "admin"];
export const CAR_STATUSES = ["pending", "approved", "rejected"];
export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "year_desc", label: "Year: newest model" },
];

// Bootstrap color for each status badge
export const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  confirmed: "primary",
  cancelled: "secondary",
  completed: "success",
};

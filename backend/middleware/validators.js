const { body, validationResult } = require("express-validator");
const {
  CITIES,
  CATEGORIES,
  TRANSMISSIONS,
  FUEL_TYPES,
  CAR_STATUSES,
  BOOKING_STATUSES,
  ROLES,
} = require("../config/constants");

// Run after the rules: stop the request if any rule failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ message: list[0].message, errors: list });
  }
  next();
};

const jordanPhone = /^07[789]\d{7}$/;

// ---------- Auth ----------
const registerRules = [
  body("name").trim().isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),
  body("email").trim().toLowerCase().isEmail().withMessage("Please enter a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone")
    .optional({ values: "falsy" })
    .matches(jordanPhone)
    .withMessage("Phone must be a Jordanian number like 0791234567"),
  body("role").optional().isIn(["customer", "owner"]).withMessage("Role must be customer or owner"),
];

const loginRules = [
  body("email").trim().toLowerCase().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileRules = [
  body("name").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),
  body("phone")
    .optional({ values: "falsy" })
    .matches(jordanPhone)
    .withMessage("Phone must be a Jordanian number like 0791234567"),
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ---------- Cars ----------
// On create every field is required, on update every field is optional
const carRules = (isUpdate) => {
  const field = (name) => (isUpdate ? body(name).optional() : body(name));
  const maxYear = new Date().getFullYear() + 1;

  return [
    field("brand").trim().notEmpty().withMessage("Brand is required"),
    field("model").trim().notEmpty().withMessage("Model is required"),
    field("year").isInt({ min: 1990, max: maxYear }).withMessage(`Year must be between 1990 and ${maxYear}`),
    field("pricePerDay").isFloat({ min: 1 }).withMessage("Price per day must be at least 1 JD"),
    field("city").isIn(CITIES).withMessage("Please choose a valid city"),
    field("category").isIn(CATEGORIES).withMessage("Please choose a valid category"),
    field("transmission").isIn(TRANSMISSIONS).withMessage("Please choose a valid transmission"),
    field("fuelType").isIn(FUEL_TYPES).withMessage("Please choose a valid fuel type"),
    body("seats").optional().isInt({ min: 2, max: 15 }).withMessage("Seats must be between 2 and 15"),
    body("imageUrl").optional({ values: "falsy" }).isURL().withMessage("Image must be a valid URL"),
    body("description").optional().isLength({ max: 1000 }).withMessage("Description is too long"),
    body("isAvailable").optional().isBoolean().withMessage("isAvailable must be true or false"),
  ];
};

// ---------- Bookings ----------
const bookingRules = [
  body("carId").isMongoId().withMessage("Invalid car"),
  body("startDate")
    .isISO8601()
    .withMessage("Start date is required")
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(value) < today) throw new Error("Start date cannot be in the past");
      return true;
    }),
  body("endDate")
    .isISO8601()
    .withMessage("End date is required")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("Return date must be after the pick-up date");
      }
      return true;
    }),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes are too long"),
];

const bookingStatusRules = [
  body("status").isIn(BOOKING_STATUSES).withMessage("Invalid booking status"),
];

// ---------- Admin ----------
const carStatusRules = [body("status").isIn(CAR_STATUSES).withMessage("Invalid car status")];

const adminUserRules = [
  body("role").optional().isIn(ROLES).withMessage("Invalid role"),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  profileRules,
  carRules,
  bookingRules,
  bookingStatusRules,
  carStatusRules,
  adminUserRules,
};

const express = require("express");
const {
  getCars,
  getCar,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { protect, optionalAuth, authorize } = require("../middleware/authMiddleware");
const { validate, carRules } = require("../middleware/validators");

const router = express.Router();

// "/mine" must come before "/:id", otherwise "mine" would be read as an id
router.get("/", getCars);
router.get("/mine", protect, authorize("owner", "admin"), getMyCars);
router.get("/:id", optionalAuth, getCar);

router.post("/", protect, authorize("owner", "admin"), carRules(false), validate, createCar);
router.put("/:id", protect, authorize("owner", "admin"), carRules(true), validate, updateCar);
router.delete("/:id", protect, authorize("owner", "admin"), deleteCar);

module.exports = router;

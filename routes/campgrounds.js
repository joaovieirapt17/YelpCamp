const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware.js"); // isLoggedIn Middleware
const campgrounds = require("../controllers/campgrounds.js");

router.get("/", catchAsync(campgrounds.index));

// New campground form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Send data via post to create a new campground
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// Show Campground
router.get("/:id", catchAsync(campgrounds.showCampground));

// Edit Campground Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Edit Campground data
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

// Delete Campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground));

module.exports = router;

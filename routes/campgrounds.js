const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware.js"); // isLoggedIn Middleware
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");
const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage }); // Store the images in cloudinary

router
  .route("/")
  // Show Campgrounds index html page
  .get(catchAsync(campgrounds.index))
  // Send data via post to create a new campground
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// New campground form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  // Show Campground
  .get(catchAsync(campgrounds.showCampground))
  // Edit Campground data
  .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
  // Delete route
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground));

// Edit Campground Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;

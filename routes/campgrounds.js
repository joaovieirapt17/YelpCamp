const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js"); // Joi inside "schemas.js"

// Func to validate campgrounds form (Middleware)
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// New campground form
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

// Send data via post to create a new campground
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground!"); // flash message middleware
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    // if not found it will trigger the flash message
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

// Edit Campground form
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params; // take the id
    const campground = await Campground.findById(id); // find the id
    // if not found it will trigger the flash message
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

// Edit Campground data
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!"); // flash message middleware
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

// Delete route
router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!"); // flash message middleware
    res.redirect("/campgrounds");
  })
);

module.exports = router;

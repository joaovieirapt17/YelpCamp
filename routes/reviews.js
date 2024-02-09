const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const Review = require("../models/reviews.js");
const Campground = require("../models/campground");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// Send the Review
router.post(
  "/",
  validateReview,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review); // push review into campground "reviews" array
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!"); // flash message middleware
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Remove the reference to the deleted review from the Campground array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the actual review document from the database
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review!"); // flash message middleware
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;

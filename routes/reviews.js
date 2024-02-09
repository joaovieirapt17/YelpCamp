const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviews = require("../controllers/reviews.js");
const catchAsync = require("../utils/catchAsync");

// Create a Review
router.post("/", validateReview, isLoggedIn, catchAsync(reviews.createReview));

// Delete a Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.destroyReview));

module.exports = router;

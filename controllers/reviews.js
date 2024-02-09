const Review = require("../models/reviews.js");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review); // push review into campground "reviews" array
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!"); // flash message middleware
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // Remove the reference to the deleted review from the Campground array
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  // Delete the actual review document from the database
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review!"); // flash message middleware
  res.redirect(`/campgrounds/${id}`);
};

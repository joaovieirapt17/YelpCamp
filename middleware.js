const { campgroundSchema, reviewSchema } = require("./schemas.js"); // Joi inside "schemas.js"
const ExpressError = require("./utils/ExpressError.js");
const Campground = require("./models/campground");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // store the url which is requesting
    req.flash("error", "You must be Signed In!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// CAMPGROUNDS MIDDLEWARE

// Func to validate campgrounds form (Middleware)
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Func to check if the user is the author of the campground
module.exports.isAuthor = async (req, res, next) => {
  // Take the id from params
  const { id } = req.params;
  const campground = await Campground.findById(id);

  // Check if the user is allowed to edit the campground
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next(); // if has permission move to next
};

// REVIEWS MIDDLEWARE

// Func to validate reviews form (Middleware)
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Func to check if the user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  // Take the id from params
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  // Check if the user is allowed to edit the review
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next(); // if has permission move to next
};

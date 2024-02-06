const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override"); // Able to use PUT/PATCH in HTML Forms
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas.js"); // Joi inside "schemas.js"
const Review = require("./models/reviews.js");

// Set the mongoose and connect it into the database
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

// Establish a connection to the MongoDB database using Mongoose
const db = mongoose.connection;
// Event handler for database connection errors
db.on("error", console.error.bind(console, "connection error:"));
// Event handler for a successful database connection
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true })); // parse the data from POST request.body
app.use(methodOverride("_method")); // use method-override

// Func to validate campgrounds form
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Func to validate reviews form
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((element) => element.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// Send data via post
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params; // take the id
    const campground = await Campground.findById(id); // find the id
    res.render("campgrounds/show", { campground });
  })
);

// Edit Campground form
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params; // take the id
    const campground = await Campground.findById(id); // find the id
    res.render("campgrounds/edit", { campground });
  })
);

// Edit Campground data
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

// Delete route
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// Send the Review
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); // push review into campground "reviews" array
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// If the route doesn't exist
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Handler
app.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  if (!error.message) error.message = "Something went wrong!";
  res.status(statusCode).render("error", { error }); // use "error.ejs"
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

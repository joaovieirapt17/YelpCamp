const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override"); // Able to use PUT/PATCH in HTML Forms
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

// REQUIRE ROUTES
const campgrounds = require("./routes/campgrounds.js"); // Campground Routes
const reviews = require("./routes/reviews.js"); // Reviews Routes

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

// ROUTES
app.use("/campgrounds", campgrounds); // Campgrounds Routes
app.use("/campgrounds/:id/reviews", reviews); // Reviews Routes

// If the route doesn't exist (404)
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

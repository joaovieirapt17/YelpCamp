const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override"); // Able to use PUT/PATCH in HTML Forms
const session = require("express-session");
const flash = require("connect-flash");
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
app.use(express.static(path.join(__dirname, "public"))); // use public directory
app.use(flash());

// SESSION CONFIG
const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // ms, sec, min, hr, days (7 days in ms)
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// FLASH MIDDLEWARE
app.use((req, res, next) => {
  res.locals.success = req.flash("success"); // local 'success' variable
  res.locals.error = req.flash("error"); // local 'error' variable
  next();
});

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

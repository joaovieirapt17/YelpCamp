if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override"); // Able to use PUT/PATCH in HTML Forms
const session = require("express-session");
const MongoStore = require("connect-mongo").create;
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const helmet = require("helmet");

const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const mongoSanitize = require("express-mongo-sanitize");

// REQUIRE ROUTES
const campgroundRoutes = require("./routes/campgrounds.js"); // Campground Route
const reviewRoutes = require("./routes/reviews.js"); // Review Route
const userRoutes = require("./routes/users.js"); // User Route

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
// Set the mongoose and connect it into the database
mongoose.connect(dbUrl);

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
app.use(mongoSanitize()); // Avoid mongo injection characters
// app.use(helmet());

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
  mongooseConnection: mongoose.connection,
});

// SESSION CONFIG
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // cookies accessed only through http
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // ms, sec, min, hr, days (7 days in ms)
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH MIDDLEWARE
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // track 'current user'
  res.locals.success = req.flash("success"); // local 'success' variable
  res.locals.error = req.flash("error"); // local 'error' variable
  next();
});

// ROUTES
app.use("/campgrounds", campgroundRoutes); // Campgrounds Routes
app.use("/campgrounds/:id/reviews", reviewRoutes); // Reviews Routes
app.use("/", userRoutes); // Users Routes

// Home
app.get("/", (req, res) => {
  res.render("home");
});

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

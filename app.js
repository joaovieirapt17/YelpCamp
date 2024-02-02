const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override"); // Able to use PUT/PATCH in HTML Forms
const ejsMate = require("ejs-mate");

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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params; // take the id
  const campground = await Campground.findById(id); // find the id
  res.render("campgrounds/show", { campground });
});

// Edit Campground form
app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params; // take the id
  const campground = await Campground.findById(id); // find the id
  res.render("campgrounds/edit", { campground });
});

// Edit Campground data
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${updatedCampground._id}`);
});

// Delete route
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

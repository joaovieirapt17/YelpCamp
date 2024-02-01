// Mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // shortcut to 'mongoose.Schema'

// Campground Schema
const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);

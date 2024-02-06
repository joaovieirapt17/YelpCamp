// Mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // shortcut to 'mongoose.Schema'

// Campground Schema
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId, // Object Id from "Review" model
      ref: "Review", // Review model
    },
  ],
});

module.exports = mongoose.model("Campground", CampgroundSchema);

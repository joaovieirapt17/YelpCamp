// Mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // shortcut to 'mongoose.Schema'
const Review = require("./reviews");

// Campground Schema
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId, // Object Id from "Review" model
      ref: "Review", // Review model
    },
  ],
});

// Mongoose Middleware to delete all associated reviews
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);

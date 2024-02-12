// Mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema; // shortcut to 'mongoose.Schema'
const Review = require("./reviews");

// Image Schema
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const opts = { toJSON: { virtuals: true } };

// Campground Schema
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
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
  },
  opts
);

// Properties outside database: ('.virtual')
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title} </a><strong>
          <p>${this.description.substring(0, 40)}...</p>`;
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

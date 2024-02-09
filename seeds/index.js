const mongoose = require("mongoose");
const Campground = require("../models/campground"); // Campground Model
const cities = require("./cities"); // Import Cities
const { places, descriptors } = require("./seedHelpers");

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

const seedDB = async () => {
  const sample = (array) => array[Math.floor(Math.random() * array.length)];
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCity = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "65c513da7db7854fcd748786",
      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptates, dolorum doloribus non fuga labore omnis facere eius deleniti quibusdam odit sit eveniet? Unde voluptate culpa nisi minus eaque porro non.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

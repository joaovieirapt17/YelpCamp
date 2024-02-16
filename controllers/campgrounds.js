const Campground = require("../models/campground");

// CLOUDINARY
const { cloudinary } = require("../cloudinary");

// MAPBOX
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // Forward and Reverse Geocode

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location, // 'location' query
      limit: 1,
    })
    .send();

  const campground = new Campground(req.body.campground);

  // geometry comes from Geocoding API
  campground.geometry = geoData.body.features[0].geometry;

  // map the array and extract the path and filename from the images
  campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));

  campground.author = req.user._id; // saves the campground author to the userId
  await campground.save();
  req.flash("success", "Successfully made a new campground!"); // flash message middleware
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  // if not found it will trigger the flash message
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id); // find the id

  // if not found it will trigger the flash message
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const { location } = req.body.campground;

  // Forward geocode the new location
  const geoData = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send();

  // Update the Campground
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
    geometry: geoData.body.features[0].geometry, // Update the geometry with new location
  });

  // map the array and extract the path and filename from the images
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));

  updatedCampground.images.push(...imgs);
  await updatedCampground.save();

  // Delete selected images
  if (req.body.deleteImages) {
    // Delete from cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully updated campground!"); // flash message middleware
  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.destroyCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!"); // flash message middleware
  res.redirect("/campgrounds");
};

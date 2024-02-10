const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);

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
  // Update the Campground
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });

  // map the array and extract the path and filename from the images
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));

  updatedCampground.images.push(...imgs);
  await updatedCampground.save();

  req.flash("success", "Successfully updated campground!"); // flash message middleware
  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.destroyCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!"); // flash message middleware
  res.redirect("/campgrounds");
};

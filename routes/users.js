const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

// Register User Form Route
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Register User Route
router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password); // hash the password
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("register");
    }
  })
);

// LogIn User Form Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// LogIn User Route ('passport.authenticate' -> Passport.js Middleware)
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect("/campgrounds");
  }
);

module.exports = router;

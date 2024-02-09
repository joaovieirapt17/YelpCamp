const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

// Form to Register a User
router.get("/register", users.renderRegister);

// Register a User
router.post("/register", catchAsync(users.registerUser));

// Form to LogIn a User
router.get("/login", users.renderLogin);

// LogIn User Route ('passport.authenticate' -> Passport.js Middleware)
router.post(
  "/login",
  storeReturnTo, // middleware to save the returnTo value from session to res.locals
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

// Logout Route
router.get("/logout", users.logout);

module.exports = router;

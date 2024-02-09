const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

router
  .route("/register")
  // Form to Register a User
  .get(users.renderRegister)
  // Register a User
  .post(catchAsync(users.registerUser));

router
  .route("/login")
  // Form to LogIn a User
  .get(users.renderLogin)
  // LogIn User Route ('passport.authenticate' -> Passport.js Middleware)
  .post(
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

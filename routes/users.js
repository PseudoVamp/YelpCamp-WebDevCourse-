const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  //passport gives us an authenticate middleware that you pass in your strategy (way of logging in, local, twitter ect)
  //also has a few options in an object that handle the redirecting and error messages for you
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      keepSessionInfo: true,
    }),
    users.login
  );

//passport has added a few other methods like logout to the req. (makes it too easy...)
router.get("/logout", users.logout);

module.exports = router;

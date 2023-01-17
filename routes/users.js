const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      //login is added by passport, but requires a callback to work, cannot await it
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "welcome to yelp camp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

//passport gives us an authenticate middleware that you pass in your strategy (way of logging in, local, twitter ect)
//also has a few options in an object that handle the redirecting and error messages for you
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    //remembers the page you were trying to login to and saves it to redirectUrl, or if just trying to log in goes to campgrounds
    const redirectUrl = req.session.returnTo || "/campgrounds";
    //after saving the Url, delete the info off of session so it doesn't get stuck and only redirects you there
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

//passport has added a few other methods like logout to the req. (makes it too easy...)
router.get("/logout", (req, res, next) => {
  //logout is from passport and terminates the session from being "logged in"
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;

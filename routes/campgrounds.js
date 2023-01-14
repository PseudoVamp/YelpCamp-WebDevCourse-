const express = require("express");
const router = express.Router();

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("../utils/catchAsync");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("../utils/ExpressError");

//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//requires our custum schema for validating form submissions using Joi
//for both creating campgrounds, and reviews on campgrounds
const { campgroundSchema } = require("../schemas.js");

//custom middleware schema to help validate the campground submissions on the back end with mongoose
//you call this by putting validateCampground as an argument
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  //if there is an error, map over error.details to get a single string error
  //pass the error along to the new Express error to be viewed
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//index page for the list of campgrounds
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//renders the new campground page (this new must come before the id search, order matters, if it was below it would treat "new" as an id)
router.get("/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});

//goes with the new page, this takes the new pages submission and creates a new campground
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if no campground is submitted, throw an error, for things like postman
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    //takes the req.body.campground information and creates a new mongoDB campground using it
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Succesfully made a new campground!");

    //once submitted, redirects you to the new campground show page
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//renders the page for the id of the campground you clicked on or searched for
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    //req.params takes the link you clicked, gets its _id, and then renders that show page
    //the .populate, expands the object ids under campground so they can be used on this page
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show.ejs", { campground });
  })
);

//renders an edit page with the form pre filled with which campground you want to edit
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
//uses methodOverride to do a .put route (its called a POST on the form though, trickery being done)
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    //destructured the req.params to grab just the id
    const { id } = req.params;
    //spread operator to take the entire req.body.campground object, and spread it into the Campground.findby... object
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//links to the button "delete campground" to send a delete request (really a post but changed with method)
router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//exports these routes for other files to use
module.exports = router;

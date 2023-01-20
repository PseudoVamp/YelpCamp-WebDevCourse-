const express = require("express");
const router = express.Router();

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("../utils/catchAsync");

//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//custom defined middleware in the middleware.js file for authenticating logged in or not
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//index page for the list of campgrounds
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//renders the new campground page (this new must come before the id search, order matters, if it was below it would treat "new" as an id)
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

//goes with the new page, this takes the new pages submission and creates a new campground
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if no campground is submitted, throw an error, for things like postman
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    //takes the req.body.campground information and creates a new mongoDB campground using it
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
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
    const campground = await Campground.findById(req.params.id)
      // .populate method fills out the data that is stored under "reviews/author" from the model, to be used in the html "campground.author.username"
      .populate({
        //populate the reviews on the CAMPSITE
        path: "reviews",
        //then out of the reviews, double populate the author for the REVIEWS
        populate: {
          path: "author",
        },
      })
      //then populate the author on the CAMPSITE
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
  })
);

//renders an edit page with the form pre filled with which campground you want to edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

//uses methodOverride to do a .put route (its called a POST on the form though, trickery being done)
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    //destructured the req.params to grab just the id
    const { id } = req.params;
    //spread operator to take the entire req.body.campground object, and spread it into the Campground.findby... object
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//links to the button "delete campground" to send a delete request (really a post but changed with method)
router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Succesfully deleted the campground");
    res.redirect("/campgrounds");
  })
);

//exports these routes for other files to use
module.exports = router;

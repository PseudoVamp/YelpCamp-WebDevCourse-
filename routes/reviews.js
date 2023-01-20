const express = require("express");
//merge params makes all avaliable parameters from the original file, and lets you use them here. instead of making them seperate by default
const router = express.Router({ mergeParams: true });

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("../utils/catchAsync");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("../utils/ExpressError");

//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//requires the review model that attatches the reviews to each campground
const Review = require("../models/review");

//requires our middleware file to be used here
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//is the route that handles adding a new review to each campground
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //pull is an operator in mongo, removes from an existing array all the instances of a value that match a specified condition
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;

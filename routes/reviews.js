const express = require("express");
//merge params makes all avaliable parameters from the original file, and lets you use them here. instead of making them seperate by default
const router = express.Router({ mergeParams: true });

//requires our custum schema for validating form submissions using Joi
//for both creating campgrounds, and reviews on campgrounds
const { reviewSchema } = require("../schemas.js");

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("../utils/catchAsync");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("../utils/ExpressError");

//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//requires the review model that attatches the reviews to each campground
const Review = require("../models/review");

//another custom middleware like above to help validate the review forms if submitted through postman
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//is the route that handles adding a new review to each campground
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
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

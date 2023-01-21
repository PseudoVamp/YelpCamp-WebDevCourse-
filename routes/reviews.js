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

//requires reviews controller file which houses all of the logic for the reviews
const reviews = require("../controllers/reviews");

//requires our middleware file to be used here
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const review = require("../models/review");

//is the route that handles adding a new review to each campground
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;

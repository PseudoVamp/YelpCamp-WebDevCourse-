//requires our custum schema for validating form submissions using Joi
//for both creating campgrounds, and reviews on campgrounds
const { campgroundSchema, reviewSchema } = require("./schemas.js");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("./utils/ExpressError");

//requires the campground model to build new campgrounds
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  //isAuthenticated is a helper method from passport, its added to the req. object, and checks if user is logged in
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in to do that!");
    return res.redirect("/login");
  }
  next();
};

//custom middleware schema to help validate the campground submissions on the back end with mongoose
//you call this by putting validateCampground as an argument
module.exports.validateCampground = (req, res, next) => {
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

//verifying middleware for updating, making sure the current user is the author of the campground
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};

//another custom middleware like above to help validate the review forms if submitted through postman
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//verifying middleware for updating, making sure the current user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};

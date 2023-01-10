const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//is the basic layout for our reviews on each campground
//the Id that is created with mongo will be attatched to particular campgrounds
const reviewSchema = new Schema({
  body: String,
  rating: Number,
});

//exports this review model to be used in other files
module.exports = mongoose.model("Review", reviewSchema);

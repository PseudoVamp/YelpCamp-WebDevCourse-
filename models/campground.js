//requires mongoose for this file
const mongoose = require("mongoose");

//is a shortcut for later so we can just call Schema.somethingHere.somethingElse. instead of writing mongoose.Schema
const Schema = mongoose.Schema;

//basic schema for out mongoDB
const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

//exports this model to be used in other files (have to import it in those files)
module.exports = mongoose.model("Campground", CampgroundSchema);

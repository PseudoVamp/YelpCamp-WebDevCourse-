//requires mongoose for this file
const mongoose = require("mongoose");

//is a shortcut for later so we can just call Schema.somethingHere.somethingElse. instead of writing mongoose.Schema
const Schema = mongoose.Schema;

//basic schema for out mongoDB
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  //this is the storage for the reviews that are created. They are saved in an array
  //and the way it saves is just an objectId that is the mongo Id for that particular review
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//exports this model to be used in other files (have to import it in those files)
module.exports = mongoose.model("Campground", CampgroundSchema);

//requires mongoose for this file
const { number } = require("joi");
const mongoose = require("mongoose");

//used to grab the reviews so you can delete them
const Review = require("./review");

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

//mongoose middleware for deleting campgrounds, also deletes the reviews associated with the campground
//findOneAndDelete is the way mongoose handles deleting from the other call of findByIdAndDelete from our app.delete route
//so to write middleware you have to find which method is really "called" on the docs
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    //queries the document to see all of the reviews in it(the document is the specific campground)
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

//exports this model to be used in other files (have to import it in those files)
module.exports = mongoose.model("Campground", CampgroundSchema);

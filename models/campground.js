//requires mongoose for this file
const { number } = require("joi");
const mongoose = require("mongoose");

//used to grab the reviews so you can delete them
const Review = require("./review");

//is a shortcut for later so we can just call Schema.somethingHere.somethingElse. instead of writing mongoose.Schema
const Schema = mongoose.Schema;

//this schema is nested inside of campgroundSchema, as an array, so we can call things on it seperately
const ImageSchema = new Schema({ url: String, filename: String });

//this virtual lets you use a thumbnail version of our images by using cloudinarys lingo
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

//have to set this option for the "virtuals" you make to show up in the javascript in the browser
const opts = { toJSON: { virtuals: true } };

//basic schema for out mongoDB
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    price: Number,
    description: String,
    location: String,
    //storage type for the author of a specific campsite, look below for more info
    //for this into to show up, you have to "populate" mongoose?/o?
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    //this is the storage for the reviews that are created. They are saved in an array
    //and the way it saves is just an objectId that is the mongo Id for that particular review
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

//this virtual makes properties in the geojson for the popup text when clicking on a campground on the cluster map
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
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

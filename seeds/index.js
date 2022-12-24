//this file is to seed the database with the fake campgrounds

//connects to the big list of cities to seed from
const cities = require("./cities");

//requires the campground model we build to use in this file
const Campground = require("../models/campground");

const { places, descriptors } = require("./seedHelpers");

//requires mongoose and connects it to the local mongoDB for us to use
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  //a few settings for mongo so it doesnt yell at us (***look into these***)
  useNewUrlParser: true,
  //this was throwing an error?!? investigate -------------------------------------------------
  //   useCreateIndex: true,
  useUnifiedTopology: true,
});

//shortcut creation
const db = mongoose.connection;
//error checking
db.on("error", console.error.bind(console, "connection error:"));
//if succesfully opened, prints this
db.once("open", () => {
  console.log("Database connected");
});

//sample picks a random index from an array given its .length
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//creates 50  random campgrounds from our array lists of places and weird seed names
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

//closes us out of the mongo connection after running this file once
seedDB().then(() => {
  mongoose.connection.close();
});

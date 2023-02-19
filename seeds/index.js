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
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "63c6b7f2affe97e1cf3fc2e7",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa voluptates architecto corporis consectetur tempore quaerat facere quia ad nemo temporibus doloribus tenetur quod impedit, voluptatem atque culpa reiciendis incidunt fuga Quaerat eum, consectetur ab molestias maiores ratione, earum facere iste, velit possimus suscipit harum reiciendis nulla quos veniam voluptatum error quibusdam adipisci recusandae deserunt. Vero commodi a sapiente officia laboriosam.",
      price: price,
      geometry: { type: "Point", coordinates: [-113.1331, 47.0202] },
      images: [
        {
          url: "https://res.cloudinary.com/dijsqclbt/image/upload/v1674516673/YelpCamp/gpbkmmklmmxnotonbzzc.jpg",
          filename: "YelpCamp/gpbkmmklmmxnotonbzzc",
        },
        {
          url: "https://res.cloudinary.com/dijsqclbt/image/upload/v1674516674/YelpCamp/v2qv2nxl4irkmxrjy6ay.jpg",
          filename: "YelpCamp/v2qv2nxl4irkmxrjy6ay",
        },
        {
          url: "https://res.cloudinary.com/dijsqclbt/image/upload/v1674516655/YelpCamp/exrnxdq3d3oscp2rkezg.jpg",
          filename: "YelpCamp/exrnxdq3d3oscp2rkezg",
        },
      ],
    });
    await camp.save();
  }
};

//closes us out of the mongo connection after running this file once
seedDB().then(() => {
  mongoose.connection.close();
});

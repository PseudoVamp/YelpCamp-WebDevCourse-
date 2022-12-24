//requires express
const express = require("express");

//lets you directly attatch paths to the app, (if being accessed from outside the app folder)
const path = require("path");

//requires the campground model we build to use in this file
const Campground = require("./models/campground");

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

//calls express to be used in this app
const app = express();

//sets you to use ejs and attatches the folder for all of the .ejs files
app.set("view engine", "ejs");
app.set("views", path.join((__dirname, "views")));

//used to parse the req.body form when creating a new campground. The form sends nothing unless you tell it HOW to send information
app.use(express.urlencoded({ extended: true }));

// "/" is the home page url
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//index page for the list of campgrounds
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

//renders the new campground page (this new must come before the id search, order matters, if it was below it would treat "new" as an id)
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});
//goes with the new page, this takes the new pages submission and creates a new campground
app.post("/campgrounds", async (req, res) => {
  //takes the req.body.campground information and creates a new mongoDB campground using it
  const campground = new Campground(req.body.campground);
  await campground.save();
  //once submitted, redirects you to the new campground show page
  res.redirect(`/campgrounds/${campground._id}`);
});

//renders the page for the id of the campground you clicked on or searched for
app.get("/campgrounds/:id", async (req, res) => {
  //req.params takes the link you clicked, gets its _id, and then renders that show page
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show.ejs", { campground });
});

//used to create one  instance of a campground to start off our database and see if its working
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "Cheap camping!",
//   });
//   await camp.save();
//   res.send(camp);
// });

//lets you use node for the server
app.listen(3000, () => {
  console.log("Serving on port 3000");
});

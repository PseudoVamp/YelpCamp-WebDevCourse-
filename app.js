//requires express
const express = require("express");

//lets you directly attatch paths to the app, (if being accessed from outside the app folder)
const path = require("path");

//is a middleware? that lets you fake a put/patch request on html forms by sending as POST but its really a put/patch
//it has to be called app.use below in the app to work
const methodOverride = require("method-override");

//requires the campground model to build new campgrounds
const Campground = require("./models/campground");

//requires the review model that attatches the reviews to each campground
const Review = require("./models/review");

//requires ejs-mate package
const ejsMate = require("ejs-mate");

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("./utils/catchAsync");

//requires our custum schema for validating form submissions using Joi
const { campgroundSchema } = require("./schemas.js");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("./utils/ExpressError");

//requires middleware morgan
const morgan = require("morgan");

//calls express to be used in this app
const app = express();

//requires mongoose and connects it to the local mongoDB for us to use
const mongoose = require("mongoose");
const { runInNewContext } = require("vm");
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

//tells the app to use ejs-mate, tells this app how to make use of some of our ejs commants
app.engine("ejs", ejsMate);
//sets you to use ejs and attatches the folder for all of the .ejs files
app.set("view engine", "ejs");
app.set("views", path.join((__dirname, "views")));

//tells the app to use urlencoded (middleware) to parse the req.body inbetween requests and sent it back in a particular way we can use
app.use(express.urlencoded({ extended: true }));

//tells the app to use methodOverride inbetween requests, middleware
app.use(methodOverride("_method"));

//tells the app to use morgan inbetween requests, middleware
app.use(morgan("tiny"));

// "/" is the home page url
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//index page for the list of campgrounds
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//renders the new campground page (this new must come before the id search, order matters, if it was below it would treat "new" as an id)
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});

//custom middleware schema to help validate the campground submissions on the back end with mongoose
//you call this by putting validateCampground as an argument
const validateCampground = (req, res, next) => {
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

//goes with the new page, this takes the new pages submission and creates a new campground
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if no campground is submitted, throw an error, for things like postman
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    //takes the req.body.campground information and creates a new mongoDB campground using it
    const campground = new Campground(req.body.campground);
    await campground.save();
    //once submitted, redirects you to the new campground show page
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//renders the page for the id of the campground you clicked on or searched for
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    //req.params takes the link you clicked, gets its _id, and then renders that show page
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show.ejs", { campground });
  })
);

//renders an edit page with the form pre filled with which campground you want to edit
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
//uses methodOverride to do a .put route (its called a POST on the form though, trickery being done)
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    //destructured the req.params to grab just the id
    const { id } = req.params;
    //spread operator to take the entire req.body.campground object, and spread it into the Campground.findby... object
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//links to the button "delete campground" to send a delete request (really a post but changed with method)
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.post(
  "/campgrounds/:id/reviews",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
  })
);

//used to create one  instance of a campground to start off our database and see if its working
// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "Cheap camping!",
//   });
//   await camp.save();
//   res.send(camp);
// });

//for EVERY(all) requests, use ExpressError class to get message and code from err
app.all("*", (req, res, next) => {
  //new error gets passed to next and hits custom error handler below
  next(new ExpressError("Page not found!", 404));
});

//generic error handler middleware
app.use((err, req, res, next) => {
  //destructures the error to take out statusCode, and asigns default status code
  const { statusCode = 500 } = err;
  //if there isn't an error message, this is set to the default one
  if (!err.message) err.message = "Oh No, Something Went Wrong";
  res.status(statusCode).render("error.ejs", { err });
  res.send("oh boy something went wrong....");
});

//lets you use node for the server
app.listen(3000, () => {
  console.log("Serving on port 3000");
});

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//comes from the .env file to store environment variables you want to keep secret
console.log(process.env.SECRET);

//requires express
const express = require("express");

//lets you directly attatch paths to the app, (if being accessed from outside the app folder)
const path = require("path");

//is a middleware? that lets you fake a put/patch request on html forms by sending as POST but its really a put/patch
//it has to be called app.use below in the app to work
const methodOverride = require("method-override");

//requires the campground model to build new campgrounds
const Campground = require("./models/campground.js");

//requires the review model that attatches the reviews to each campground
const Review = require("./models/review");

//requires the user model that creates NEW users (uses passport)
const User = require("./models/user");

//helmet middleware, composed of 11 different middleware for security
const helmet = require("helmet");

//mongo sanitizer for query strings, so they cant be injected with any extra commands
const mongoSanitize = require("express-mongo-sanitize");

//all the routes are put into seperate files below
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//requires ejs-mate package
const ejsMate = require("ejs-mate");

//passport = password manager for other logins (google/fb), the local version is what we are currently using, stored locally?!?!?
const passport = require("passport");
const LocalStrategy = require("passport-local");

//requires session, which is used to save a tiny or fake database about the user, ex:view count
//gives req a new method. req.session.
const sessions = require("express-session");
//flash lets you write something ONCE to a user. "OK logged in!"
const flash = require("connect-flash");

//requires error class to use, logs out error messages and stuff
const ExpressError = require("./utils/ExpressError");

//requires middleware morgan
const morgan = require("morgan");

//calls express to be used in this app
const app = express();

//requires mongoose and connects it to the local mongoDB for us to use
const mongoose = require("mongoose");
const { runInNewContext } = require("vm");
const session = require("express-session");
const { date } = require("joi");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  //a few settings for mongo so it doesnt yell at us (***look into these***)
  useNewUrlParser: true,
  //this was throwing an error?!? investigate -------------------------------------------------
  //   useCreateIndex: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
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

//tells express there is a folder named public to serve our static assets from, requires
app.use(express.static(path.join(__dirname, "public")));

//tells mongoSanitize to be used for this app
app.use(mongoSanitize());

//sets up our session cookie for tracking if still logged in and stuff
const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret!",
  //old settings?!?!?!?
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //will make sure this only loads over httpS
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

//tells the app to use session, and passes in our configuration for the cookie from above
app.use(session(sessionConfig));
//tells the app to use flash (the little success or failure messages that flash up)
app.use(flash());

//enables the 11 middleware with helmet
app.use(helmet());

//custom made for this site so helmets "content-security-policy" doesn't block every outside source from loading
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dijsqclbt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//tells this app to use passport as a login manager thing
app.use(passport.initialize());
//middleware to use persistent login sessions (cookie related??), so you dont have to login on every request to a verified page
//use passport.session AFTER using regular old session
app.use(passport.session());

//tells passport to use the LocalStrategy that we have downloaded and required
//and for the LocalStrategy, the authentication method is located on our user model, and its called authenticate
//authenticate comes from passport, it is a built in static method
passport.use(new LocalStrategy(User.authenticate()));

//how to store a user in the "session" and how to take them out (keeps people "logged in")
//two other "addons" that have been added from passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//tells the app to use morgan inbetween requests, middleware
app.use(morgan("tiny"));

//middleware used BEFORE route handlers to give us access to flash messages in every route
app.use((req, res, next) => {
  //can be used to display a popup success or error message, under the key of flash
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  //(passport adds user onto req.) , then we put it here to give us access on every template to see the current user
  res.locals.currentUser = req.user;
  next();
});

//route handlers - tells the app to use the seperate route files, depending on which url is asked for
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// "/" is the home page url
app.get("/", (req, res) => {
  res.render("home.ejs");
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

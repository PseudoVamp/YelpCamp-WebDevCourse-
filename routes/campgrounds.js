const express = require("express");
const router = express.Router();

//requires our other file that has the async function error catching "wrapper"
const catchAsync = require("../utils/catchAsync");

//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//requires the controllers that house all of the campground routes logic
const campgrounds = require("../controllers/campgrounds");

//custom defined middleware in the middleware.js file for authenticating logged in or not
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

//multer middleware adds a body and file/s object to the request object
const multer = require("multer");
//requires the storage variable we made to tell cloudinary how to store things - for multer to use
const { storage } = require("../cloudinary/index");
//sets the destination for multer to put the files
const upload = multer({ storage });
//upload.single and upload.array middleware will parse the form and store the files

//one router.route can handle all the different type of requests under one method, by chanining on .post .get ect
router
  .route("/")
  //index page for the list of campgrounds
  .get(catchAsync(campgrounds.index))
  //goes with the new page, this takes the new pages submission and creates a new campground
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

//renders the new campground page (this new must come before the id search, order matters, if it was below it would treat "new" as an id)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//one router for all of the :id pages
router
  .route("/:id")
  //renders the page for the id of the campground you clicked on or searched for
  .get(catchAsync(campgrounds.showCampground))
  //uses methodOverride to do a .put route (its called a POST on the form though, trickery being done)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  //links to the button "delete campground" to send a delete request (really a post but changed with method)
  .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

//renders an edit page with the form pre filled with which campground you want to edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

//exports these routes for other files to use
module.exports = router;

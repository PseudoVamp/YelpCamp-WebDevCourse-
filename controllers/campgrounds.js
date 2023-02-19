//requires the campground model to build new campgrounds
const Campground = require("../models/campground");

//requires cloudinary from our other file so we can delete images from the cloudinary server from this page
const { cloudinary } = require("../cloudinary");

//requires mapbox, to use its geocoding search for latitude and longitude
const mxbGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
//gets mapbox token from the .env file
const mapBoxToken = process.env.MAPBOX_TOKEN;
//requires the token to use this for forward AND reverse geocoding
const geocoder = mxbGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new.ejs");
};

module.exports.createCampground = async (req, res, next) => {
  //uses mapbox to get the lat and long of the user input on input new campground form
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  //if no campground is submitted, throw an error, for things like postman
  // if (!req.body.campground)
  //   throw new ExpressError("Invalid Campground Data", 400);
  //takes the req.body.campground information and creates a new mongoDB campground using it
  const campground = new Campground(req.body.campground);
  //saves the lat. and long. array index 0 onto the campground object
  campground.geometry = geoData.body.features[0].geometry;
  //saves the image upload url and filename to a variable under the campground object for use like deleting
  //multer adds array to req.files, then we add that array onto campgrounds
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Succesfully made a new campground!");

  //once submitted, redirects you to the new campground show page
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  //req.params takes the link you clicked, gets its _id, and then renders that show page
  //the .populate, expands the object ids under campground so they can be used on this page
  const campground = await Campground.findById(req.params.id)
    // .populate method fills out the data that is stored under "reviews/author" from the model, to be used in the html "campground.author.username"
    .populate({
      //populate the reviews on the CAMPSITE
      path: "reviews",
      //then out of the reviews, double populate the author for the REVIEWS
      populate: {
        path: "author",
      },
    })
    //then populate the author on the CAMPSITE
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show.ejs", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  //destructured the req.params to grab just the id
  const { id } = req.params;
  //spread operator to take the entire req.body.campground object, and spread it into the Campground.findby... object
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  //if there is stuff in deleteImages array, take them and see if it matches mongo to delete them from cloudinary
  if (req.body.deleteImages) {
    //loop over each one and use this cloudinary lingo to delete the image from cloudinary servers
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    //pull the images out of the array to be displayed
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Succesfully deleted the campground");
  res.redirect("/campgrounds");
};

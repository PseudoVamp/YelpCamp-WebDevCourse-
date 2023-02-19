//Joi is an error handling middleware, joi.dev
const Joi = require("joi");

//joi is a validation for things like postman (serverside), making these things required
//this shorthand creates and exports it for use in one go
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    //makes sure that req.body has campground and all of the required pieces
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});

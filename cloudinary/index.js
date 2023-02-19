//cloudinary hosting app and multer middleware to parse the data correctly for storage
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//sets up cloudinary to use our credentials from the secret file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//sets cloudinary to use specific types and where to store files
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpg", "png", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};

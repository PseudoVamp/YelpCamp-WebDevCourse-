const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//passport is the password manager, it can require passport + passport-local + passport-local-mongoose for use
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//this plugin adds on to the UserSchema a field for a unique username, and a password, and adds additional methods onto UserSchema
//adds the authenticate method that we call ,used for basic login, in the app.js file
UserSchema.plugin(passportLocalMongoose);

//exports this UserSchema for use in other places
module.exports = mongoose.model("User", UserSchema);

module.exports.isLoggedIn = (req, res, next) => {
  //isAuthenticated is a helper method from passport, its added to the req. object, and checks if user is logged in
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in to do that!");
    return res.redirect("/login");
  }
  next();
};

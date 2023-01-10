//a lot of comments here... this shit is rather confusing... just trying to remember what this does

//""""""""return a function, that accepts a function,
//and then executes that function, but it catches any errrors
//and passes the error to next();
//You use this to wrap async functions in and catch errors"""""""""

//func is what you pass in
module.exports = (func) => {
  //this will return a new function
  return (req, res, next) => {
    //this new function executes func, catches errors if there are any, and passes the error to next
    func(req, res, next).catch(next);
  };
};

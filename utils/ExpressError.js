//is the layout we are going to use to display any errors we catch
class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

//exports this particular class to be used in other files
module.exports = ExpressError;

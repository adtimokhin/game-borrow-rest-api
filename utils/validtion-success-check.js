const { validationResult } = require("express-validator");

// Checks whether there are errors detected by the middleware. If yes, this method will also throw an error.
module.exports = checkForValidationErrors = (req, errorMessage) => {
  if (!errorMessage) {
    errorMessage = "Invalid input";
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errorMessage);
    err.statusCode = 422;
    err.data = errors.array();

    throw err;
  }
};

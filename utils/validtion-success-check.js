const { validationResult } = require("express-validator");

/**
 * Checks whether there are errors detected by the middleware. If yes, this method will also throw an error.
 * @param {*} req
 * @param {String} errorMessage message that will be set to response body if invalid input was entered by client
 * @throws Error if invalid input was provided by client
 */
module.exports = checkForValidationErrors = (
  req,
  errorMessage = "Invalid input"
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errorMessage);
    err.statusCode = 422;
    err.data = errors.array();

    throw err;
  }
};

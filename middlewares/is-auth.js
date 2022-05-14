const jwt = require("jsonwebtoken");
const getJWTSecret = require("../utils/jwt-security.js").getJWTSecret;

const throwInvalidJWTError = (statusCode = 500) => {
  const error = new Error("Invalid JWT token.");
  error.statusCode = statusCode;
  error.message = "Invalid JWT token.";
  throw error;
};

/**
 * This funnction checks the headers to find the 'Authorization' header. It will then determine whether the JWT passed is valid.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throwInvalidJWTError(401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throwInvalidJWTError(401);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, getJWTSecret());
  } catch (err) {
    throwInvalidJWTError();
  }

  if (!decodedToken) {
    throwInvalidJWTError(401);
  }
  next();
};

module.exports.throwInvalidJWTError = throwInvalidJWTError;

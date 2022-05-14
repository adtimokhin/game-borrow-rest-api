const publisherService = require("../services/publisher.js");
const jwt = require("jsonwebtoken");
const getJWTSecret = require("../utils/jwt-security.js").getJWTSecret;

const throwInvalidJWTError = require("./is-auth.js").throwInvalidJWTError;

/**
 * This method will check whether the information passed about the gameId or publisherId matches reqcords with JWT token
 *
 * Contains a check of publisher id and game id. Performs only oneS
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.isPublisher = (req, res, next) => {
  const gameId = req.params.gameId;
  const jwtToken = req.get("Authorization").split()[1];
  let userId;
  try {
    const token = jwt.decode(jwtToken, getJWTSecret());
    userId = token.payload.userId;
  } catch (err) {
    throw err;
  }

  if (!gameId) {
    publisherService
      .getPublisherByGameId(gameId)
      .then((publisher) => {
        if (!publisher) {
          const err = new Error("unkown game id");
          err.statusCode = statusCode;
          throw err;
        }

        if (publisher.users.includes(userId.toString())) {
          next();
        } else {
          // JWT contains a user Id that is not assosciated with a given publisher
          throwInvalidJWTError(401);
        }
      })
      .catch((err) => {
        throw err;
      });
  } else {
    const publisherId = req.body.publisherId;
    if (!publisherId) {
      const err = new Error("Could not find publisher identification");
      err.statusCode = 400;
      throw err;
    }

    publisherService
      .getPublisherById(publisherId)
      .then((publisher) => {
        if (!publisher) {
          const err = new Error("Invalid publisher id");
          err.statusCode = statusCode;
          throw err;
        }
        if (publisher.users.includes(userId.toString())) {
          next();
        } else {
          // JWT contains a user Id that is not assosciated with a given publisher
          throwInvalidJWTError(401);
        }
      })
      .catch((err) => {
        throw err;
      });
  }
};

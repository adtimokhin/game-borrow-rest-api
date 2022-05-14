const publisherService = require("../services/publisher.js");

const throwInvalidJWTError = require("./is-auth.js").throwInvalidJWTError;

/**
 * This method will check whether the information passed about the gameId or publisherId matches reqcords with JWT token
 *Prior to calling this method a isAuth() must be called
 *
 * Contains a check of publisher id and game id. Performs only oneS
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.isPublisher = async (req, res, next) => {
  const gameId = req.params.gameId;
  let userId = req.userId;

  if (gameId) {
    let publisher;
    try {
      publisher = await publisherService.getPublisherByGameId(gameId);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!publisher) {
      const err = new Error("unkown game id");
      err.statusCode = 400;
      throw err;
    }

    if (publisher.users.includes(String(userId))) {
      next();
    } else {
      // JWT contains a user Id that is not assosciated with a given publisher
      throwInvalidJWTError(401);
    }
  } else {
    const publisherId = req.body.publisherId;
    if (!publisherId) {
      const err = new Error("Could not find publisher identification");
      err.statusCode = 400;
      throw err;
    }

    let publisher;
    try {
      publisher = await publisherService.getPublisherById(publisherId);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }

    if (!publisher) {
      const err = new Error("Invalid publisher id");
      err.statusCode = 400;
      throw err;
    }
    if (publisher.users.includes(String(userId))) {
      next();
    } else {
      // JWT contains a user Id that is not assosciated with a given publisher
      throwInvalidJWTError(401);
    }
  }
};

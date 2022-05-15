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

const isPublisher = async (req, res, next) => {
  const gameId = req.params.gameId;
  const userId = req.userId;
  if (gameId) {
    const publisher = await publisherService.getPublisherByGameId(gameId);
    if (!publisher) {
      const err = new Error("unkown game id");
      err.statusCode = 400;
      throw err;
    }

    if (!publisher.users.includes(String(userId))) {
      //           // JWT contains a user Id that is not assosciated with a given publisher
      throwInvalidJWTError(401);
    }
  } else {
    const publisherId = req.body.publisherId;
    if (!publisherId) {
      const err = new Error("Could not find publisher identification");
      err.message = "Could not find publisher identification";
      err.statusCode = 400;
      throw err;
    }

    const publisher = await publisherService.getPublisherById(publisherId);
    if (!publisher) {
      const err = new Error("unkown publisher id");
      err.statusCode = 400;
      throw err;
    }
    if (!publisher.users.includes(String(userId))) {
      //           // JWT contains a user Id that is not assosciated with a given publisher
      throwInvalidJWTError(401);
    }
  }
};

// const isPublisher = (req, res, next) => {
//   const gameId = req.params.gameId;
//   const userId = req.userId;
//   if (gameId) {
//     publisherService
//       .getPublisherByGameId(gameId)
//       .then((publisher) => {
//         if (!publisher) {
//           const err = new Error("unkown game id");
//           err.statusCode = 400;
//           throw err;
//         }

//         if (publisher.users.includes(String(userId))) {
//         } else {
//           // JWT contains a user Id that is not assosciated with a given publisher
//           throwInvalidJWTError(401);
//         }
//       })
//       .catch((err) => {
//         throw err;
//       });
//   } else {
//     const publisherId = req.body.publisherId;
//     if (!publisherId) {
//       const err = new Error("Could not find publisher identification");
//       err.message = "Could not find publisher identification";
//       err.statusCode = 400;
//       throw err;
//     }

//    publisherService
//       .getPublisherById(publisherId)
//       .then((publisher) => {
//         if (!publisher) {
//           const err = new Error("Invalid publisher id");
//           err.statusCode = 400;
//           throw err;
//         }
//         if (publisher.users.includes(String(userId))) {
//           next();
//         } else {
//           // JWT contains a user Id that is not assosciated with a given publisher
//           throwInvalidJWTError(401);
//         }
//       })
//       .catch((err) => {
//         throw err;
//       });
//   }
// };

module.exports.isPublisher = isPublisher;

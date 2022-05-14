const gameService = require("../services/game.js");
const Game = require("../models/game.js");

const checkForValidationErrors = require("../utils/validtion-success-check.js");
const updateField = require("../utils/update-field.js");
const Response = require("../response.js");

const emailSender = require("../utils/email/email-sender.js");

/**
 * Gets all game objects from the database
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getAllGames = async (req, res, next) => {
  try {
    const games = await gameService.getAllGames();
    const response = new Response(200, "Data was fetched", games);
    res.status(response.statusCode).json(response);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

/**
 * Gets a single game from the database using gameId field from params. If none was found, method will return an empty Response object
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.getGameById = async (req, res, next) => {
  checkForValidationErrors(req);
  const gameId = req.params.gameId;

  try {
    const game = await gameService.getGameById(gameId);
    if (game) {
      // If game is not null:
      const response = new Response(200, "Data was fetched", game);
      res.status(response.statusCode).json(response);
    } else {
      const response = new Response(204, "Game is not found");
      res.status(response.statusCode).json(response);
    }
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Deletes a game from the database using gameId. Prior to calling this method check that the client has a premission to perform this action. Also validate publisherId
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.deleteGame = (req, res, next) => {
  checkForValidationErrors(req, "Could not proceed with the request");
  const gameId = req.params.gameId;
  gameService
    .deleteGame(gameId)
    .then((result) => {
      console.log("result :>> ", result); // TODO: check what is returned when nothing was deleted and when the game was deleted.
      // TODO: Broadcast a message to users telling that the game was deleted
      // TODO: Broadcast a message to publisher confirming that the game was deleted
      const response = new Response(204, "Deleted");
      res.status(response.statusCode).json(response);
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Allows to update inofrmation about the game. This method allows to pass in the body the following parameters : //TODO:
 * GameId is immutable and cannot be updated.
 * Checks confirming that the client computer has a permision to update the game and that they hold a valid publisher key must be present prior to calling this method.
 * Publisher information cannot be modified
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.patchGame = (req, res, next) => {
  const gameId = req.params.gameId;
  const title = req.body.title;
  const description = req.body.description;
  const filesLocation = req.body.filesLocation; // TODO: When I learn how to interact with files update the update logic in this method
  const imageURIs = req.body.imageURIs; // TODO: When I learn how to interact with files, update this logic

  const errors = [];
  gameService
    .getGameById(gameId)
    .then((game) => {
      if (!game) {
        const response = new Response(422, "No game was found using this id");
        res.status(response.statusCode).json(response);
      }

      // Trying to update the fields of the object
      try {
        updateField(game, "title", title);
      } catch (err) {
        errors.push(err);
      }
      try {
        updateField(game, "description", description);
      } catch (err) {
        errors.push(err);
      }
      try {
        updateField(game, "filesLocation", filesLocation);
      } catch (err) {
        errors.push(err);
      }
      try {
        updateField(game, "imageURIs", imageURIs);
      } catch (err) {
        errors.push(err);
      }

      // Sending an error response to client if any errors with the input were detected
      if (errors.length != 0) {
        const response = new Response(422, "Invalid input", errors);
        res.status(response.statusCode).json(response);
      } else {
        gameService
          .updateGame(game)
          .then((result) => {
            console.log("result :>> ", result); // TODO: Check what this 'result' is.
            // TODO: Broadcast a message to publisher confirming that the game was updated.
            const response = new Response(204, "Game was updated");
            res.status(response.statusCode).json(response);
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Adds a new game to the database.
 * Prior to calling this method you must be certtain that the client has a permission to publish the game and that the client owns a valid publisher token.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.postGame = (req, res, next) => {
  checkForValidationErrors(req);
  const title = req.body.title;
  const description = req.body.description;
  const filesLocation = req.body.filesLocation; // TODO: When I learn how to interact with files update the update logic in this method
  const imageURIs = req.body.imageURIs; // TODO: Learn how to use files!!!
  const publisherId = "627d4bb8f5fc25bef742f644"; // TODO: When you add a publisher entity add extraction of publisher id out of publisher token

  const game = new Game(
    title,
    description,
    filesLocation,
    imageURIs,
    publisherId
  );

  gameService
    .saveGame(game)
    .then((game) => {
      const response = new Response(201, "Game was added", { _id: game._id });
      res.status(response.statusCode).json(response);
    })
    .catch((err) => {
      next(err);
    });
};

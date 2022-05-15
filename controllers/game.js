const gameService = require("../services/game.js");
const Game = require("../models/game.js");

const publisherService = require("../services/publisher.js");

const checkForValidationErrors = require("../utils/validtion-success-check.js");
const updateField = require("../utils/update-field.js");
const Response = require("../response.js");

const emailSender = require("../utils/email/email-sender.js");
const { isPublisher } = require("../middlewares/is-publisher.js");

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
  try {
    checkForValidationErrors(req);
    const gameId = req.params.gameId;
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
module.exports.deleteGame = async (req, res, next) => {
  try {
    await isPublisher(req, res, next);

    checkForValidationErrors(req, "Could not proceed with the request");
    const gameId = req.params.gameId;
    const game = await gameService.getGameById(gameId);
    const result = await gameService.deleteGame(gameId);
    if (result.deletedCount == 0) {
      const err = new Error("no game with this game id exists");
      err.statusCode = 400;
      throw err;
    }

    const publisher = await publisherService.getPublisherByGameId(gameId);

    await publisherService.removeGameFromPublisher(
      String(publisher._id),
      gameId
    );
    // TODO: Broadcast a message to users telling that the game was deleted
    emailSender.sendHTMLTemplateEmail(
      publisher.email,
      `${game.title} was removed from the game-borrow`,
      "game-removed-notification",
      {
        gameName: game.title,
      }
    );
    const response = new Response(204, "Deleted");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
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
module.exports.patchGame = async (req, res, next) => {
  try {
    checkForValidationErrors(req);
    const gameId = req.params.gameId;
    const title = req.body.title;
    const description = req.body.description;
    const filesLocation = req.body.filesLocation; // TODO: When I learn how to interact with files update the update logic in this method
    const imageURIs = req.body.imageURIs; // TODO: When I learn how to interact with files, update this logic
    const errors = [];

    if (!(title || description || filesLocation || imageURIs)) {
      const err = new Error("No fields are updated");
      err.statusCode = 422;
      throw err;
    }

    await isPublisher(req, res, next);

    const game = await gameService.getGameById(gameId); // We know for fact that there is a game with this gameId because we call isPublisher()
    const oldTitle = game.title;
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
      const errorMessages = [];
      for (var i = 0; i < errors.length; i++) {
        errorMessages.push(errors[i].message);
      }
      const response = new Response(422, "Invalid input", errorMessages);
      res.status(response.statusCode).json(response);
    } else {
      await gameService.updateGame(game);
      //sending email to publisher:
      const publihser = await publisherService.getPublisherByGameId(gameId);
      emailSender.sendHTMLTemplateEmail(
        // TODO: Add a game-update-notification email template
        publihser.email,
        `${oldTitle} Has been updated`,
        "server-shutdown-notification",
        {}
      );
      // sending response
      const response = new Response(204, "Game was updated");
      res.status(response.statusCode).json(response);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Adds a new game to the database.
 * Prior to calling this method you must be certtain that the client has a permission to publish the game and that the client owns a valid publisher token.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports.postGame = async (req, res, next) => {
  let game;
  try {
    await isPublisher(req, res, next);

    checkForValidationErrors(req);

    const title = req.body.title;
    const description = req.body.description;
    const filesLocation = req.body.filesLocation; // TODO: When I learn how to interact with files update the update logic in this method
    const imageURIs = req.body.imageURIs; // TODO: Learn how to use files!!!
    const publisherId = req.body.publisherId;

    game = new Game(title, description, filesLocation, imageURIs, publisherId);

    await gameService.saveGame(game);
    await publisherService.addGameToPublisher(publisherId, String(game._id));

    const publisher = await publisherService.getPublisherById(publisherId);

    emailSender.sendHTMLTemplateEmail(
      publisher.email,
      `${game.title} is added to the game-borrow`,
      "game-added-notification",
      {
        gameName: game.title,
      }
    );

    const response = new Response(204, "User was verificated");

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

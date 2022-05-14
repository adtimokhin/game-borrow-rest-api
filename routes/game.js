const express = require("express");
const router = express.Router();

const isPublisher = require("../middlewares/is-publisher.js").isPublisher;

const { body, param } = require("express-validator");

const controller = require("../controllers/game.js");

const gameService = require("../services/game.js");

// Returns a list of all game entities
// /games
router.get("/games", controller.getAllGames);

// Returns a single game entity by gameId, specified in params
// /game/:gameId
router.get(
  "/game/:gameId",
  [param("gameId").not().isEmpty().withMessage("game id must be specified")],
  controller.getGameById
);

// Adds a new game entity into the database. Must have fields checked against a list of validations
// /game
router.post(
  "/game",
  [
    body("title").isString().withMessage("must be string value"),
    body("title")
      .isLength({ min: 3 })
      .withMessage("Minimal length is 3 characters"),
    body("title").custom((value, { req }) => {
      gameService.getGameByTitle(value).then((game) => {
        if (game) {
          Promise.reject("Game with this name already exists");
        }
      });
    }),
    body("description").isString().withMessage("must be string value"),
    body("description")
      .isLength({ min: 20 })
      .withMessage("Minimal length is 20 characters"),
    body("filesLocation").not().isEmpty().withMessage("Cannot be empty"),
    body("imageURIs").isArray().withMessage("Must be array"),
    body("imageURIs").custom((value, { req }) => {
      if (value.length < 1) {
        return Promise.reject("Must contain at least one image URI");
      }
    }),
    isPublisher,
  ],
  controller.postGame
);

// Deletes a game entity. Can only be done by a person that is a part of Publisher team
// /game/:gameId
router.delete(
  "/game/:gameId",
  [
    param("gameId").not().isEmpty().withMessage("game id must be specified"),
    isPublisher,
  ],
  controller.deleteGame
);

// Updated a number of fields of a game entity. Can only be done by a person that is a part of Publisher team
// /game/:gameId
router.patch(
  "/game/:gameId",
  [
    param("gameId").not().isEmpty().withMessage("cannot be empty"),
    body("title").custom((value, { req }) => {
      if (value) {
        if (!(typeof value === "string" || value instanceof String)) {
          Promise.reject("must be string value");
        }
        if (value.length < 3) {
          Promise.reject("Minimal length is 3 characters");
        }
      }
    }),
    body("description").custom((value, { req }) => {
      if (value) {
        if (!(typeof value === "string" || value instanceof String)) {
          Promise.reject("must be string value");
        }
        if (value.length < 20) {
          Promise.reject("Minimal length is 20 characters");
        }
      }
    }),
    body("filesLocation").custom((value, { req }) => {
      if (value) {
        if (value == "") {
          Promise.reject("cannot be empty");
        }
      }
    }),
    body("imageURIs").custom((value, { req }) => {
      if (value) {
        if (!(typeof value === "array" || value instanceof Array)) {
          Promise.reject("Must be an array");
        }
        if (value.length < 1) {
          Promise.reject("Must contain at least one image URI");
        }
      }
    }),
    isPublisher,
  ],
  controller.patchGame
);

module.exports = router;

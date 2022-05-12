const express = require("express");
const router = express.Router();

const { body, param } = require("express-validator");

const controller = require("../controllers/game.js");

// TODO: Add middleware checks!!
router.get("/games", controller.getAllGames);
router.get("/game/:gameId", controller.getGameById);
router.post("/game", controller.postGame);
router.delete("/game/:gameId", controller.deleteGame);
router.patch("/game:gameId", controller.patchGame);

module.exports = router;

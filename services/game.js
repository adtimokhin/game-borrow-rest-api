const ObjectId = require("mongodb").ObjectId;
const getDb = require("../utils/databse").getDb;
const Game = require("../models/game.js");

const GAMES_COLLECTION = "games";

/**
 * Returns an array of all games in the database
 * @returns Promise that will have in its callback function all games in the database
 */
module.exports.getAllGames = () => {
  return getDb().collection(GAMES_COLLECTION).find().toArray();
};

/**
 * Finds a game by id
 * @param {String} gameId Id of game
 * @returns Promise that will contain the response from the database
 */
module.exports.getGameById = (gameId) => {
  return getDb()
    .collection(GAMES_COLLECTION)
    .findOne({ _id: new ObjectId(gameId) });
};

/**
 * Innserts a new Game object to the database
 * @param {Game} game
 * @returns Promise that contains a success parameter. It will be true if the user was added to the databse
 */
module.exports.saveGame = (game) => {
  return getDb().collection(GAMES_COLLECTION).insertOne(game);
};

/**
 *Deletes a game objejct from the database
 * @param {String} gameId Id of game
 * @returns Promise that contains a message about whether the deletion was acknowledged
 */
module.exports.deleteGame = (gameId) => {
  return getDb()
    .collection(GAMES_COLLECTION)
    .deleteOne({ _id: new ObjectId(gameId) });
};

/**
 * Updated all fields for a passed game object. Its _id field must be unchanged
 * @param {Game} game object that is already stored in database, and for which you wish to update a few fields
 * @returns Promise that acknowledges the ooperation
 */
module.exports.updateGame = (game) => {
  return getDb()
    .collection(GAMES_COLLECTION)
    .updateOne({ _id: new ObjectId(game._id) }, { $set: game });
};

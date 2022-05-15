const Publisher = require("../models/publisher");

const ObjectId = require("mongodb").ObjectId;
const getDb = require("../utils/databse").getDb;

const PUBLISHERS_COLLECTION = "publishers";

module.exports.getAllPublishers = () => {
  return getDb().collection(PUBLISHERS_COLLECTION).find().toArray();
};

/**
 *
 * @param {String} publisherId should match one of ids of entity Publisher
 */
module.exports.getPublisherById = (publisherId) => {
  return getDb()
    .collection(PUBLISHERS_COLLECTION)
    .findOne({ _id: new ObjectId(publisherId) });
};

/**
 *
 * @param {String} gameId id of a game
 */
module.exports.getPublisherByGameId = (gameId) => {
  return getDb().collection(PUBLISHERS_COLLECTION).findOne({ games: gameId });
};

/**
 *
 * @param {Publisher} publisher Publisher entity that will be saved to db
 */
module.exports.savePublisher = (publisher) => {
  return getDb().collection(PUBLISHERS_COLLECTION).insertOne(publisher);
};

/**
 * Updated all fields for a passed publisher object. Its _id field must be unchanged.
 *
 * Only certain fields can be updated. Appropriate checks must be done prior to calling this method
 * @param {Publisher} publisher object that is already stored in database, and for which you wish to update a few fields
 * @returns Promise that acknowledges the ooperation
 */
module.exports.updatePublisher = (publisher) => {
  return getDb()
    .collection(PUBLISHERS_COLLECTION)
    .updateOne({ _id: new ObjectId(publisher._id) }, { $set: publisher });
};

/**
 * Adds a new game to publisher
 * @param {String} publisherId Publisher's id
 * @param {String} gameId new Game's id
 * @returns
 */
module.exports.addGameToPublisher = (publisherId, gameId) => {
  return getDb()
    .collection(PUBLISHERS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(publisherId) },
      { $push: { games: gameId } }
    );
};

/**
 * Removes a new game to publisher
 *
 * @param {String} publisherId Publisher's id
 * @param {String} gameId new Game's id
 * @returns
 */
module.exports.removeGameFromPublisher = (publisherId, gameId) => {
  return getDb()
    .collection(PUBLISHERS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(publisherId) },
      { $pull: { games: gameId } }
    );
};

/**
 *
 * @param {Srting} publisherId
 * @param {String} userEmail
 * @returns
 */
module.exports.addUserToPublisher = (publisherId, userEmail) => {
  return getDb()
    .collection(PUBLISHERS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(publisherId) },
      { $push: { users: userEmail } }
    );
};

module.exports.getPublisherByName = (name) => {
  return getDb().collection(PUBLISHERS_COLLECTION).findOne({ name: name });
};


module.exports.getPublisherByEmail = (email) => {
  return getDb().collection(PUBLISHERS_COLLECTION).findOne({ email: email });
}

module.exports.getPublisherByUserEmail = (email) => {
  return getDb().collection(PUBLISHERS_COLLECTION).findOne({ users: email });
}
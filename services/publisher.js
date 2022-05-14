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

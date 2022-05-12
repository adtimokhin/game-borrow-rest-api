const ObjectId = require("mongodb").ObjectId;

class Game {
  /**
   *
   * @param {String} title full name of the game
   * @param {String} description description of the game
   * @param {String} filesFolder location that stores all files of the game
   * @param {String[]} imageURIs an array of URIs that constain screenshots of the game
   * @param {String} publisherId Id of publisher
   * @param {String} id id of the entity
   */
  constructor(
    title,
    description,
    filesFolder,
    imageURIs,
    publisherId,
    id = undefined
  ) {
    this.title = title;
    this.description = description;
    this.filesFolder = filesFolder;
    this.imageURIs = imageURIs;
    this.publisherId = publisherId;
    this._id = id ? new ObjectId(id) : null;
  }
}

module.exports = Game;

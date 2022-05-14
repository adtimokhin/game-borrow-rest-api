const ObjectId = require("mongodb").ObjectId;

class Publisher {
  /**
   * @param {String} name publisher's title
   * @param {String} website link to publisher's website
   * @param {String} email publisher's email
   * @param {String[]} users ids of users that are associated with the publisher's team
   * @param {String[]} games ids of games that belong to the publisher
   * @param {String} id _id of the entity
   */
  constructor(name, website, email, users, games, id) {
    this.name = name;
    this.website = website;
    this.email = email;
    this.users = users;
    this.games = games;
    this._id = id ? new ObjectId(id) : null;
  }
}

module.exports = Publisher;

const ObjectId = require("mongodb").ObjectId;

const generateToken = require("../utils/token-generator.js").generateToken;

const UserToken = require("../user/user-token.js");

class User {
  constructor(email, password, role, id) {
    this.email = email;
    this.password = password;
    this.role = role;
    this.verified = false;
    this.emailVerification = new UserToken(generateToken());
    this._id = id ? new ObjectId(id) : null;
  }
}

module.exports = User;

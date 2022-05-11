const ObjectId = require("mongodb").ObjectId;
const getDb = require("../utils/databse").getDb;

module.exports.saveUser = (user) => {
  // adds user to the database
  return getDb().collection("users").insertOne(user); // todo: add a validation middleware.
};

module.exports.findUserByEmail = (email) => {
  // finds a user by email
  return getDb().collection("users").find({ email: email }).next();
};

module.exports.findByEmailVerificationToken = (token) => {
  return getDb()
    .collection("users")
    .findOne({ "emailVerification.tokenValue": token });
};

module.exports.findUserByPasswordToken = (token) => {
    return getDb()
      .collection("users")
      .findOne({ "passwordToken.tokenValue": token });
  };

module.exports.replaceUser = (user) => {
  // Replaces user. The passed user must be already stored in the database and their _id must not be changed.
  return getDb()
    .collection("users")
    .replaceOne({ _id: new ObjectId(user._id) }, { ...user });
};

module.exports.updateUser = (user) => {
  // Updates user. The passed user must be already stored in the database and their _id must not be changed.
  return getDb()
    .collection("users")
    .updateOne({ _id: new ObjectId(user._id) }, { $set: user });
};

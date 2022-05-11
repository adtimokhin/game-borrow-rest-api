const ObjectId = require("mongodb").ObjectId;

// Current variant of this method will simply generate a ObjectId and then return it.
module.exports.generateToken = () => {
  const token = new ObjectId();
  return token.toString();
};

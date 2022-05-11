const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const fs = require("fs")
const ini = require("ini")

const config = ini.parse(fs.readFileSync("./properties/config.ini", "utf-8")); 

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(config.database.uri)
    .then((client) => {
      console.log("Successfully connected to mongoDB.");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw "No connection with mongoDB is established yet!";
  }
};


module.exports.getDb = getDb;
module.exports.mongoConnect = mongoConnect;
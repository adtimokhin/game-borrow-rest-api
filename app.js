const express = require("express");
const fs = require("fs");
const ini = require("ini"); // library to work with .ini files link: https://github.com/npm/ini
const bodyParser = require("body-parser");

const app = express();

const database = require("./utils/databse.js");
const isAuth = require("./middlewares/is-auth.js").isAuth;

// Routes
const userRouter = require("./routes/user.js");
const gameRouter = require("./routes/game.js");

// Creating a new JWT secret to use before the launch of the application.
const config = ini.parse(fs.readFileSync("./properties/config.ini", "utf-8")); // opening connection with a file that constains configuartion information.
const generateJWTSecret = require("./utils/jwt-security.js").generateJWTSecret;
config.jwt.secret = generateJWTSecret();
fs.writeFileSync("./properties/config.ini", ini.stringify(config));

// Setting deault settings for the routes in the application
app.use(bodyParser.json());

// Setting deafult headers to requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Setting the routes
app.use(config.default.apiRoute, userRouter);
app.use(config.default.apiRoute, isAuth, gameRouter);

//Default error-handling route
app.use((err, req, res, next) => {
  console.log("err :>> ", err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message: message, data: data });
});

// Connecting to the database and then launching the application.
database.mongoConnect(() => {
  app.listen(process.env.PORT || 8080);
});

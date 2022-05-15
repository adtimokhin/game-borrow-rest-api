const UserService = require("../services/user.js");
const User = require("../models/user.js");
const UserToken = require("../user/user-token.js");

const checkForValidationErrors = require("../utils/validtion-success-check.js");

const getJWTSecret = require("../utils/jwt-security.js").getJWTSecret;
const generateToken = require("../utils/token-generator.js").generateToken;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const ini = require("ini"); // library to work with .ini files link: https://github.com/npm/ini

const Response = require("../response.js");

const emailSender = require("../utils/email/email-sender.js");

const isTokenExpired = (oldDate) => {
  const timeNow = new Date().getTime();
  const timeCreated = oldDate;
  const timeDiff = timeNow - timeCreated;

  const config = ini.parse(fs.readFileSync("./properties/config.ini", "utf-8")); // opening connection with a file that constains configuartion information.

  return timeDiff > config.user.tokenLifespan;
};

// Adds the user to the databse. This method will encrypt the password. This method assusmes that all appropriate validdations are carried out by the middleware.
module.exports.postSignUp = async (req, res, next) => {


  let emailVerificationToken;
  try {

    checkForValidationErrors(req ,"Invalid data is inputted.");

    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    const encryptedPassword = await bcrypt.hash(password, 12);
    const user = new User(email, encryptedPassword, role);
    const result = await UserService.saveUser(user);
    emailSender.sendHTMLTemplateEmail(
      user.email,
      "Email Verification",
      "email-verification",
      {
        email: user.email,
        token: emailVerificationToken,
      }
    );
    const response = new Response(201, "New user was added to the database", {
      user: { _id: result.insertedId },
    });

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

// Returns a JWT token if the user is permitted to log in to the application.
module.exports.getLogin = async (req, res, next) => {
  try {
    checkForValidationErrors(req);

    const email = req.body.email;
    const password = req.body.password;
    const user = await UserService.findUserByEmail(email);
    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    if (!user.verified) {
      const err = new Error("Must verify email first.");
      err.statusCode = 422;
      throw err;
    }

    // return to the user a JWT token if validations have been successful.
    const token = jwt.sign(
      {
        userId: user._id,
      },
      getJWTSecret(),
      { expiresIn: "1h" }
    );

    const response = new Response(200, "User was verified", {
      token: token,
    });

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

// This method will update user's verification status (remove the correcsponding field form the object) if the email token passed matches the one that was setted when the userr was added to the database
module.exports.putVerificationStatus = async (req, res, next) => {
  try {
    checkForValidationErrors(req);

    const token = req.params.token;
    const user = await UserService.findByEmailVerificationToken(token);
    if (!user) {
      const err = new Error("Invalid token.");
      err.statusCode = 401;
      throw err;
    }

    let updatedUser = {};

    updatedUser._id = user._id;
    updatedUser.email = user.email;
    updatedUser.password = user.password;
    updatedUser.role = user.role;
    updatedUser.verified = true;

    await UserService.replaceUser(updatedUser);

    const response = new Response(204, "User was verificated");

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

// This method will set a new password verification token if none was set or if the token has expired. If the token is still valid an error would be thrown.
module.exports.putPassswordUpdateVerificationToken = async (req, res, next) => {
  try {

    checkForValidationErrors(req, "Email must be provided.");

    const email = req.body.email;
    let passwordToken;

    const user = await UserService.findUserByEmail(email);

    if (!user) {
      const err = new Error("No user with such email was foud.");
      err.statusCode = 422;
      throw err;
    }

    if (!user.verified) {
      const err = new Error("Email not verified");
      err.statusCode = 401;
      throw err;
    }

    if (user.passwordToken) {
      if (isTokenExpired(user.passwordToken.created.getTime())) {
        // If time difference is > 5h
        delete user.passwordToken;
      } else {
        const err = new Error("Token has not yet expired.");
        err.statusCode = 422;
        throw err;
      }
    }

    // assigning a new token.
    passwordToken = generateToken();
    user.passwordToken = new UserToken(passwordToken);

    await UserService.updateUser(user);

    const response = new Response(
      204,
      "New password verification token was setted."
    );

    emailSender.sendHTMLTemplateEmail(
      user.email,
      "Resetting Password",
      "password-reset",
      {
        email: user.email,
        token: user.passwordToken.tokenValue,
      }
    );

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

// This method will update user's password.
module.exports.putPassswordUpdate = async (req, res, next) => {
  try {
    checkForValidationErrors(req);

    const token = req.params.token;
    const newPassword = req.body.password;
    let fail = false

    const user = await UserService.findUserByPasswordToken(token);
    if (!user) {
      const err = new Error("Invalid token.");
      err.statusCode = 401;
      throw err;
    }

    if (isTokenExpired(user.passwordToken.created)) {
      delete user.passwordToken;
      fail = true;
      return UserService.replaceUser(user);
    }

    const result = await bcrypt.hash(newPassword, 12);

    if (fail) {
      // password verification token has expired.
      const err = new Error("Token has expired.");
      err.statusCode = 402;
      throw err;
    }

    user.password = result;
    await UserService.updateUser(user);

    const response = new Response(204, "User was verificated");

    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

// TODO: Make it only possible for user to update their own user entity

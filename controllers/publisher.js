const publisherService = require("../services/publisher.js");
const UserService = require("../services/user.js");
const Publisher = require("../models/publisher.js");

const checkForValidationErrors = require("../utils/validtion-success-check.js");
const updateField = require("../utils/update-field.js");
const Response = require("../response.js");

const emailSender = require("../utils/email/email-sender.js");
const { isPublisher } = require("../middlewares/is-publisher.js");

module.exports.getAllPublishers = async (req, res, next) => {
  try {
    const publishers = await publisherService.getAllPublishers();
    for (var i = 0; i < publishers.length; i++) {
      delete publishers[i].users;
    }
    const response = new Response(200, "Data was fetched", publishers);
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.getPublisherById = async (req, res, next) => {
  try {
    checkForValidationErrors(req);
    const publisherId = req.params.publisherId;

    const publisher = await publisherService.getPublisherById(publisherId);
    if (publisher) {
      // If publisher is not null:
      delete publisher.users; // no one should see associated users
      const response = new Response(200, "Data was fetched", publisher);
      res.status(response.statusCode).json(response);
    } else {
      const response = new Response(204, "Game is not found");
      res.status(response.statusCode).json(response);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.patchPublisher = async (req, res, next) => {
  try {
    checkForValidationErrors(req);

    const publisherId = req.params.publisherId;
    const name = req.body.name;
    const email = req.body.email;
    const website = req.body.website;

    if (!(name || email || website)) {
      const err = new Error("No fields are updated");
      err.statusCode = 422;
      throw err;
    }

    await isPublisher(req, res, next);

    const errors = [];

    const publisher = await publisherService.getPublisherById(publisherId);
    if (!publisher) {
      const response = new Response(
        422,
        "No publihser was found using this id"
      );
      res.status(response.statusCode).json(response);
    }

    // Trying to update the fields of the object
    try {
      updateField(publisher, "name", name);
    } catch (err) {
      errors.push(err);
    }
    try {
      updateField(publisher, "email", email);
    } catch (err) {
      errors.push(err);
    }
    try {
      updateField(publisher, "website", website);
    } catch (err) {
      errors.push(err);
    }

    if (errors.length != 0) {
      const errorMessages = [];
      for (var i = 0; i < errors.length; i++) {
        errorMessages.push(errors[i].message);
      }
      const response = new Response(422, "Invalid input", errorMessages);
      res.status(response.statusCode).json(response);
    }

    await publisherService.updatePublisher(publisher);
    // TODO: Broadcast a message to publisher confirming that the information was updated was updated.
    // TODO: Decide how to check for new email and website!!
    const response = new Response(204, "Game was updated");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};


module.exports.patchPublisherAddUser = async (req, res, next) => {
  const userEmail = req.body.email;
  const publisherId = req.params.publisherId;

  try {
    await isPublisher(req, res, next);
    const publisher = await publisherService.getPublisherById(publisherId);
    if (!publisher) {
      const response = new Response(400, "no publisher is found");
      res.status(response.statusCode).json(response);
    }

    if (publisher.users.includes(userEmail)) {
      const response = new Response(
        400,
        "User is already associated with this publisher"
      );
      res.status(response.statusCode).json(response);
    }

    //checking whether the user with this email exists
    const user = await UserService.findUserByEmail(userEmail);
    if (!user) {
      const response = new Response(400, "User is does not exist");
      res.status(response.statusCode).json(response);
    }

    if (!user.verified) {
      const response = new Response(400, "User is not verified");
      res.status(response.statusCode).json(response);
    }

    // If all is fine, adding user to publisher
    await publisherService.addUserToPublisher(publisherId, userEmail);

    const response = new Response(204, "User added");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.postPublisher = async (req, res, next) => {
  try {
    //name, website, email, users, games, id
    const name = req.body.name;
    const website = req.body.website;
    const email = req.body.email;
    const users = req.body.users; // must contain at least one user
    const games = []; //initially no games are associated with any publisher

    const publihser = new Publisher(name, website, email, users, games);

    await publisherService.savePublisher(publihser);

    // TODO: Send welcome publisher email

    const response = new Response(204, "Game added to database");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

//TODO: Finish making endpoints for this entity
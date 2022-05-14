const publisherService = require("../services/publisher.js");
const Publisher = require("../models/publisher.js");

const checkForValidationErrors = require("../utils/validtion-success-check.js");
const updateField = require("../utils/update-field.js");
const Response = require("../response.js");

const emailSender = require("../utils/email/email-sender.js");

module.exports.getAllPublishers = (req, res, next) => {
  publisherService
    .getAllPublishers()
    .then((publishers) => {
      for (var i = 0; i < publishers.length; i++) {
        delete publishers[i].users;
      }

      const response = new Response(200, "Data was fetched", publishers);
      res.status(response.statusCode).json(response);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getPublisherById = (req, res, next) => {
  checkForValidationErrors(req);
  const publisherId = req.params.publisherId;
  // TODO: add validation of gameId format????
  publisherId
    .getPublisherById(publisherId)
    .then((publisher) => {
      if (publisher) {
        // If publisher is not null:
        delete publisher.users; // no one should see associated users
        const response = new Response(200, "Data was fetched", publisher);
        res.status(response.statusCode).json(response);
      } else {
        const response = new Response(204, "Game is not found");
        res.status(response.statusCode).json(response);
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.patchPublisher = (req, res, next) => {
  const publisherId = req.params.publisherId;
  const name = req.body.name;
  const email = req.body.email;
  const website = req.body.website;

  const errors = [];
  publisherService
    .getPublisherById(publisherId)
    .then((publisher) => {
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

      // Sending an error response to client if any errors with the input were detected
      if (errors.length != 0) {
        const response = new Response(422, "Invalid input", errors);
        res.status(response.statusCode).json(response);
      } else {
        publisherService
          .updatePublisher(publisher)
          .then((result) => {
            console.log("result :>> ", result); // TODO: Check what this 'result' is.
            // TODO: Broadcast a message to publisher confirming that the information was updated was updated.
            // TODO: Decide how to check for new email and website!!
            const response = new Response(204, "Game was updated");
            res.status(response.statusCode).json(response);
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};

//TODO: Finish making endpoints for this entity
module.exports.patchPublisherAddUser = (req, res, next) => {
  next();
};

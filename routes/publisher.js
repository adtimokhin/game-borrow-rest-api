const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const publisherService = require("../services/publisher.js");

const controller = require("../controllers/publisher.js");

router.get("/publishers", controller.getAllPublishers);

router.get("/publisher/:publisherId", controller.getPublisherById);

router.post(
  "/publisher",
  [
    body("name").isString().withMessage("must be string value"),
    body("name")
      .isLength({ min: 1 })
      .withMessage("minimum length is 3 characters"),
    body("name").custom((value) => {
      return publisherService.getPublisherByName(value).then((publihser) => {
        if (publihser) {
          return Promise.reject("Game with this name already exists");
        }
      });
    }).withMessage("Game with this name already exists"),

    body("website").isURL().withMessage("must be URL"),

    body("email").isEmail().withMessage("must be email"),
    // body('email').custom()

  ],
  controller.postPublisher
);

module.exports = router;

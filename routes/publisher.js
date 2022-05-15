const express = require("express");
const { body, param } = require("express-validator");
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
    body("name")
      .custom((value) => {
        return publisherService.getPublisherByName(value).then((publihser) => {
          if (publihser) {
            return Promise.reject("Game with this name already exists");
          }
        });
      })
      .withMessage("Publisher with this name already exists"),

    body("website").isURL().withMessage("must be URL"),

    body("email").isEmail().withMessage("must be email"),
    body("email")
      .custom((value) => {
        return publisherService.getPublisherByEmail(value).then((publisher) => {
          if (publisher) {
            return Promise.reject("Publisher with this email already exists");
          }
        });
      })
      .withMessage("This email is already in use"),

    body("users").custom((value) => {
      if (!(typeof value === "array" || value instanceof Array)) {
        return Promise.reject("Must be an array");
      }

      var i = 0;
      for (i; i < value.length; i++) {
        const email = value[i];
        if (!(typeof email === "string" || email instanceof String)) {
          return Promise.reject("Must contain only strings");
        } else if (
          !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        ) {
          return Promise.reject("Must contain only emails");
        }
      }
      if (i == 0) {
        return Promise.reject("Must contain at least one email");
      }

      return true;
    }),
  ],
  controller.postPublisher
);

router.patch(
  "/add/user/publisher/",
  [body("userEmail").isEmail().withMessage("must be email format")],
  controller.patchPublisherAddUser
);

router.patch(
  "/publisher",
  [
    
    body("name").custom((value) => {
      if (value !== undefined) {
        if (!(typeof value === "string" || value instanceof String)) {
          return Promise.reject("must be string value");
        }
        if (value.length < 1) {
          return Promise.reject("Minimal length is 3 characters");
        }
      }
      return true;
    }),

    body("email").custom((value) => {
      if (value !== undefined) {
        if (!(typeof value === "string" || value instanceof String)) {
          return Promise.reject("must be string value");
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          return Promise.reject("not email format");
        }

        return publisherService.getPublisherByEmail(value).then((result) => {
          if (result) {
            return Promise.reject("This email is in use");
          }
        });
      }

      return true;
    }),

    body("website").custom((value) => {
      if (value !== undefined) {
        if (!(typeof value === "string" || value instanceof String)) {
          return Promise.reject("must be string value");
        }
        // TODO: Check for URL format
      }
      return true;
    }),
  ],
  controller.patchPublisher
);

module.exports = router;

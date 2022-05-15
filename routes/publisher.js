const express = require("express");
const router = express.Router();

const controller = require("../controllers/publisher.js");

router.get("/publishers", controller.getAllPublishers);

router.get("/publisher/:publisherId", controller.getPublisherById);



module.exports = router;

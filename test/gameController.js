const expect = require("chai").expect;
const sinon = require("sinon");
const gameService = require("../services/game.js");

const gameController = require("../controllers/game.js");

describe("Game controller", function () {
  describe("getAllGames", function () {
    it("Should throw an error with a code 500 if a getAllGames() throws an error", function (done) {
      sinon.stub(gameService, "getAllGames");
      gameService.getAllGames.throws();
      gameController
        .getAllGames({}, {}, (err) => {
          throw err;
        })
        .catch((err) => {
          expect(err).to.be.an("error");
          expect(err).to.have.property("statusCode", 500);
          done();
        });

      gameService.getAllGames.restore();
    });
  });
});

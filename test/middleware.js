const isAuthMiddleware = require("../middlewares/is-auth.js").isAuth;
const isPublisherMiddleare =
  require("../middlewares/is-publisher.js").isPublisher;

const jwt = require("jsonwebtoken");
const publisherService = require("../services/publisher");

// Testing stuff
const expect = require("chai").expect;
const sinon = require("sinon");
describe("Middleware functions", function () {
  describe("is-auth.js", function () {
    it("Should throw an error if no Authentication header is passed", function () {
      const req = {
        get: function () {
          return null;
        },
      };

      expect(isAuthMiddleware.bind(this, req, {}, () => {})).to.throw(
        "Invalid JWT token"
      );
    });

    it("Should throw an error if Authentication token is not made out of two parts, separated with a space", function () {
      const req = {
        get: function () {
          return "hjbkjwnlsjbdvudkulhi";
        },
      };
      expect(isAuthMiddleware.bind(this, req, {}, () => {})).to.throw(
        "Invalid JWT token"
      );
    });

    it("Should yield a userId field from a JWT token and add the userId field to a request", function () {
      const req = {
        get: function () {
          return "hjbkjwnlsjbdvudkulhi dndndndn";
        },
      };

      sinon.stub(jwt, "verify");
      jwt.verify.returns({ userId: "DummyUserId" });
      isAuthMiddleware(req, {}, () => {});
      expect(req).to.have.property("userId").eq("DummyUserId");
      expect(jwt.verify.called).to.be.true;
      jwt.verify.restore();
    });
  });

  describe("is-publisher.js", function () {
    it("Should throw an error if neither gameId nor publisherId is specified", function (done) {
      const req = {
        body: {
          publisherId: null,
        },
        params: {
          gameId: null,
        },
      };

      isPublisherMiddleare(req, {}, () => {}).catch((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property(
          "message",
          "Could not find publisher identification"
        );
        done();
      });
    });

    it("Should throw an error if no game was found using game id", function (done) {
      const req = {
        params: {
          gameId: "cjfjndjdkjkwjkbjbb",
        },
      };

      sinon.stub(publisherService, "getPublisherByGameId");
      publisherService.getPublisherByGameId.returns(null);

      isPublisherMiddleare(req, {}, () => {}).catch((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("message", "unkown game id");
        expect(result).to.have.property("statusCode", 400);
        done();
      });

      publisherService.getPublisherByGameId.restore();
    });

    it("Should throw an error if no publisher is associated with the publisherId passed", function (done) {
      const req = {
        body: {
          publisherId: "dummyId",
        },
        params: {},
      };
      sinon.stub(publisherService, "getPublisherById");
      publisherService.getPublisherById.returns(null);

      isPublisherMiddleare(req, {}, () => {}).catch((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("message", "Invalid publisher id");
        expect(result).to.have.property("statusCode", 400);
        done();
      });

      publisherService.getPublisherById.restore();
    });
    describe("Should throw an error if JWT contains a userId that is not associated with a given publisher", function () {
      it("Should throw the error with a set gameId", function (done) {
        const req = {
          params: {
            gameId: "cjfjndjdkjkwjkbjbb",
          },
        };

        sinon.stub(publisherService, "getPublisherByGameId");
        publisherService.getPublisherByGameId.returns({
          users: ["other random id", "another random id"],
        });

        isPublisherMiddleare(req, {}, () => {}).catch((result) => {
          expect(result).to.be.an("error");
          expect(result).to.have.property("message", "Invalid JWT token");
          expect(result).to.have.property("statusCode", 401);
          done();
        });

        publisherService.getPublisherByGameId.restore();
      });
      it("Should throw the error with a set publisherId", function (done) {
        const req = {
          body: {
            publisherId: "dummyId",
          },
          params: {},
        };

        sinon.stub(publisherService, "getPublisherById");
        publisherService.getPublisherById.returns({
          users: ["other random id", "another random id"],
        });

        isPublisherMiddleare(req, {}, () => {}).catch((result) => {
          expect(result).to.be.an("error");
          expect(result).to.have.property("message", "Invalid JWT token");
          expect(result).to.have.property("statusCode", 401);
          done();
        });

        publisherService.getPublisherById.restore();
      });
    });

    describe("Should throw an error with code 500 if publisherService methods fail", function () {
      it("Should thow an error with code 500 if getPublisherByGameId() throws an error", function (done) {
        const req = {
          params: {
            gameId: "cjfjndjdkjkwjkbjbb",
          },
        };

        sinon.stub(publisherService, "getPublisherByGameId");
        publisherService.getPublisherByGameId.throws();

        isPublisherMiddleare(req, {}, () => {}).catch((result) => {
          expect(result).to.be.an("error");
          expect(result).to.have.property("statusCode", 500);
          done();
        });

        publisherService.getPublisherByGameId.restore();
      });

      it("Should throw an error with code 500 if getPublisherById() throws an error", function (done) {
        const req = {
          body: {
            publisherId: "dummyId",
          },
          params: {},
        };
        sinon.stub(publisherService, "getPublisherById");
        publisherService.getPublisherById.throws();

        isPublisherMiddleare(req, {}, () => {}).catch((result) => {
          expect(result).to.be.an("error");
          expect(result).to.have.property("statusCode", 500);
          done();
        });

        publisherService.getPublisherById.restore();
      });
    });
  });
});

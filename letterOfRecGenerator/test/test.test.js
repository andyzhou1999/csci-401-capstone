const request = require("supertest");
const db = require("../db");
const app = require("../app");
const common = require("./common");

describe("Unit Test for Letter of Recommendation Generator", () => {
  afterAll(done => {
    db.disconnect(done);
  });

  describe("Test Homepage", () => {
    test("It should return 302 status code with GET method to home page", () => {
      return request(app)
        .get("/")
        .then(response => {
          expect(response.statusCode).toBe(302);
        });
    });
  });
});
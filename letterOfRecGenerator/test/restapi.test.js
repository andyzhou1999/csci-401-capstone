const request = require("supertest");
const app = require("../app");

describe("Unit Test for Utility API and Resources", () => {
  describe("Test Country Code API", () => {
    test("Country code API should have 200 status", () => {
      request(app)
        .get("/api/countryCodes")
        .then(response => {
          expect(response.statusCode).toBe(200);
        });
    });
  });

  describe("Test University List API", () => {
    test("University list API should have 200 status.", () => {
      request(app)
        .get("/api/universityList")
        .then(response => {
          expect(response.statusCode).toBe(200);
        });
    });

    test("University list API should return a non-empty list as response body.", () => {
      request(app)
        .get("/api/universityList")
        .then(response => {
          expect(response.body instanceof Array).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    test("University list should contain some random popular universities.", () => {
      request(app)
        .get("/api/universityList")
        .then(response => {
          expect(response.body).toContain("University of Southern California");
          expect(response.body).toContain("University of California, Los Angeles");
          expect(response.body).toContain("University of California, Berkeley");
          expect(response.body).toContain("Harvard University");
          expect(response.body).toContain("Yale University");
          expect(response.body).toContain("Carnegie Mellon University");
        });
    });
  });
});

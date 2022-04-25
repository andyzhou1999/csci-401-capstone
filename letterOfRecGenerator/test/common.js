const path = require("path");
const fs = require("fs");
const privateKey = fs.readFileSync(
    path.join(__dirname, "../config/jwtRS256.key")
  );
const jwt = require("jsonwebtoken");

const common = {};

common.token = jwt.sign(
    {
      iss: "Letter of Recommendation Generator",
      aud: "946973074370-6k1l3346s9i1jtnj3tf7j797vtc6ua3j.apps.googleusercontent.com",
      email: "test2@usc.edu",
    },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "1h",
    }
);

module.exports = common;
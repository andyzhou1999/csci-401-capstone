var express = require("express");
var User = require("../models/user");
var Form = require("../models/form");
var jwt_decode = require("jwt-decode");

var router = express.Router();

//load student's responses to questions
router.get("/", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  var questions = [];

  user.getForm(req.query.id, function (err, form) {
    if (err) {
      console.log(err);
    } else {
      questions = form.getFormattedQuestions();
      questions.forEach(i => {
        i.question = decodeURIComponent(i.question);
      });
      res.render("pages/response", {
        title: "Received Responses for " + form.email,
        id: req.query.id,
        questions: questions,
        responses: form.getResponses(),
      });
    }
  });
});

module.exports = router;

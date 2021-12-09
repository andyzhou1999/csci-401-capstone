var express = require("express");
var User = require("../models/user");
var fs = require("fs");
var path = require("path");
const publicKey = fs.readFileSync(
  path.join(__dirname, "../config/jwtRS256.key.pub")
);
const jwt_decode = require("jwt-decode");
var router = express.Router();

router.get("/", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  var letterheadImg;
  var footerImg;
  var saveStatus = req.query.saveSwitch;
  var questions;
  if (req.query.id) {
    if (saveStatus == "true") {
      letterheadImg = user.getTemplate(req.query.id).letterheadImg;
      footerImg = user.getTemplate(req.query.id).footerImg;
      questions = user.getTemplate(req.query.id).getQuestions();
      res.render("pages/template-editor", {
        title: "EDITING TEMPLATE",
        templateName: req.query.title,
        id: req.query.id,
        letterheadImage: letterheadImg,
        footerImage: footerImg,
        saveSwitch: req.query.saveSwitch,
        questions: questions,
      });
    } else {
      letterheadImg = user.getDeactivatedTemplate(req.query.id).letterheadImg;
      footerImg = user.getDeactivatedTemplate(req.query.id).footerImg;
      questions = user.getDeactivatedTemplate(req.query.id).getQuestions();
      res.render("pages/template-editor", {
        title: "VIEWING ARCHIVED TEMPLATE",
        templateName: req.query.title,
        id: req.query.id,
        letterheadImage: letterheadImg,
        footerImage: footerImg,
        saveSwitch: req.query.saveSwitch,
        questions: questions,
      });
    }
  } else {
    res.render("pages/template-editor", {
      title: "CREATE A NEW TEMPLATE",
      templateName: req.query.title,
      id: null,
      letterheadImage: null,
      footerImage: null,
      saveSwitch: true,
      questions: [
        { question: "What is your first name?", tag: "<!FNAME>" },
        { question: "What is your last name?", tag: "<!LNAME>" },
        {
          question: "What is your preferred personal pronoun (subject)?",
          tag: "<!SUB_PRONOUN>",
        },
        {
          question: "What is your preferred personal pronoun (object)",
          tag: "<!OBJ_PRONOUN>",
        },
        {
          question: "What is your preferred possessive pronoun?",
          tag: "<!POS_PRONOUN>",
        },
        { question: "What organizations are you applying to?", tag: "<!ORG>" },
      ],
    });
  }
});

router.get("/edit", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  if (req.query.id) {
    var templateName = user.getTemplate(req.query.id).getName();
    var questions = user.getTemplate(req.query.id).getQuestions();
    res.json({
      title: templateName,
      id: req.query.id,
      saveSwitch: true,
      questions: questions,
    });
  } else {
    res.json({
      title: null,
      id: null,
      saveSwitch: true,
      questions: [
        { question: "What is your first name?", tag: "<!FNAME>" },
        { question: "What is your last name?", tag: "<!LNAME>" },
        {
          question: "What is your preferred personal pronoun (subject)?",
          tag: "<!SUB_PRONOUN>",
        },
        {
          question: "What is your preferred personal pronoun (object)",
          tag: "<!OBJ_PRONOUN>",
        },
        {
          question: "What is your preferred possessive pronoun?",
          tag: "<!POS_PRONOUN>",
        },
        { question: "What organizations are you applying to?", tag: "<!ORG>" },
      ],
    });
  }
});

router.get("/deactivated-edit", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  if (req.query.id) {
    var templateName = user.getDeactivatedTemplate(req.query.id).getName();
    var questions = user.getDeactivatedTemplate(req.query.id).getQuestions();
    res.json({
      title: templateName,
      id: req.query.id,
      saveSwitch: false,
      questions: questions,
    });
  } else {
    res.json({
      title: null,
      id: null,
      saveSwitch: false,
      questions: [
        { question: "What is your first name?", tag: "<!FNAME>" },
        { question: "What is your last name?", tag: "<!LNAME>" },
        {
          question: "What is your preferred personal pronoun (subject)?",
          tag: "<!SUB_PRONOUN>",
        },
        {
          question: "What is your preferred personal pronoun (object)",
          tag: "<!OBJ_PRONOUN>",
        },
        {
          question: "What is your preferred possessive pronoun?",
          tag: "<!POS_PRONOUN>",
        },
        { question: "What organizations are you applying to?", tag: "<!ORG>" },
      ],
    });
  }
});

router.get("/template", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  if (req.query.saveSwitchData == "true") {
    res.json({
      letter: user.getTemplate(req.query.id).getText(),
      questions: user.getTemplate(req.query.id).getQuestions(),
      letterheadImg: user.getTemplate(req.query.id).getLetterheadImg(),
      footerImg: user.getTemplate(req.query.id).getFooterImg(),
      saveSwitch: req.query.saveSwitchData,
    });
  } else {
    res.json({
      letter: user.getDeactivatedTemplate(req.query.id).getText(),
      questions: user.getDeactivatedTemplate(req.query.id).getQuestions(),
      letterheadImg: user
        .getDeactivatedTemplate(req.query.id)
        .getLetterheadImg(),
      footerImg: user.getDeactivatedTemplate(req.query.id).getFooterImg(),
      saveSwitch: req.query.saveSwitchData,
    });
  }
});

router.post("/create", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.addTemplate(req.body.template, function (err, id) {
    console.log(req.body.template);
    if (err) {
      console.log(err);
      if (err.message == "DUPLICATE NAME") {
        console.log("error is duplicate name");
        res.status(500).send({ error: "Duplicate Name" });
      }
    } else {
      res.json({
        success: "Created Successfully",
        status: 200,
        id: id,
      });
    }
  });
});

router.post("/update", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.updateTemplate(req.body.id, req.body.template, function (err, template) {
    if (err) {
      console.log(err);
    } else {
      res.json({
        success: "Updated Successfully",
        status: 200,
      });
    }
  });
});

module.exports = router;

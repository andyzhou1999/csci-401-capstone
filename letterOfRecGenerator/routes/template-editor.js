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
        saveButton: 1,
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
        saveButton: 0,
      });
    }
  } else {
    res.render("pages/template-editor", {
      title: "Create A New Template",
      templateName: req.query.title,
      id: null,
      letterheadImage: null,
      footerImage: null,
      saveSwitch: true,
      saveButton:1,
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
      saveButton: 1,
      questions: questions,
    });
  } else {
    res.json({
      title: null,
      id: null,
      saveSwitch: true,
      saveButton:1,
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
      saveButton:0,
      questions: questions,
      
    });
  } else {
    res.json({
      title: null,
      id: null,
      saveSwitch: false,
      saveButton:0,
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

  // console.log("template one @@@@@@@@@@@@@");
  // console.log(user.getTemplate(req.query.id));
  // console.log(user.getDeactivatedTemplate(req.query.id));
  // console.log(user.getTemplates());
  // console.log(user.getDeactivatedTemplates());

  if (req.query.saveSwitchData == "true") {
    res.json({
      letter: user.getTemplate(req.query.id).getText(),
      questions: user.getTemplate(req.query.id).getQuestions(),
      letterheadImg: user.getTemplate(req.query.id).getLetterheadImg(),
      footerImg: user.getTemplate(req.query.id).getFooterImg(),
      saveSwitch: req.query.saveSwitchData,
      ops: user.getTemplate(req.query.id).getOps(),
    });
  } else {
    //console.log("ops check:")
    //console.log(user.getTemplate(req.query.id).hasOps())
    res.json({
      letter: user.getDeactivatedTemplate(req.query.id).getText(),
      questions: user.getDeactivatedTemplate(req.query.id).getQuestions(),
      letterheadImg: user
        .getDeactivatedTemplate(req.query.id)
        .getLetterheadImg(),
      footerImg: user.getDeactivatedTemplate(req.query.id).getFooterImg(),
      saveSwitch: req.query.saveSwitchData,
      ops: user.getDeactivatedTemplate(req.query.id).getOps(),
      //ops: [],
      //ops: user.getTemplate(req.query.id).getOps()==null?[]:user.getTemplate(req.query.id).getOps(),
    });
  }
});

router.post("/create", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  let user_templates_archived=user.getDeactivatedTemplates().toObject();

  let templateName_repeate=false;

  user_templates_archived.forEach((el)=>{
    if(el._id!=req.body.id&&el.name==req.body.template.name){
      templateName_repeate=true;

    }

  });

  if(templateName_repeate){
    res.status(500).send({ error: "Duplicate Name" });
  }
  else{
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
  }
  
});

router.post("/update", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));
  
  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });

  let user_templates=user.getTemplates().toObject();
  let user_templates_archived=user.getDeactivatedTemplates().toObject();

  let templateName_repeate=false;
  user_templates.forEach((el)=>{
    if(el._id!=req.body.id&&el.name==req.body.template.name){
      templateName_repeate=true;

    }

  });

  user_templates_archived.forEach((el)=>{
    if(el._id!=req.body.id&&el.name==req.body.template.name){
      templateName_repeate=true;

    }

  });
  
  if(templateName_repeate){
    res.status(500).send({ error: "Duplicate Name" });
  }
  else{
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
  }

});

module.exports = router;

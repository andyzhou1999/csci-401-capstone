var express = require("express");
var router = express.Router();
var db = require("../db");
var fs = require("fs");
var User = require("../models/user");
const jwt_decode = require("jwt-decode");

/* GET Templates page. */
router.get("/", async function (req, res, next) {
  var currLetterTemplate = __dirname + "/uploads/" + "letterTemplate";
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  if (!fs.existsSync(currLetterTemplate)) {
    currLetterTemplate = "";
  }

  user.getForms((err, forms) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("template dashboard:");
    console.log(user.getTemplate());
    console.log(user.getDeactivatedTemplate());
    var templates = user.getTemplates().toObject();
    //do not transmit ops because it is not needed to display on template dashboard
    templates.forEach((template) => {
      delete template.ops;
    });
    var tmp_metric = {};
    var last_used = {};
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].template) {
        var tmp_id = forms[i].template._id;
        if (!tmp_metric[tmp_id]) {
          tmp_metric[tmp_id] = 0;
        }
        tmp_metric[tmp_id]++;
        last_used[tmp_id] = forms[i]._id.getTimestamp();
      }
    }
    for (var i = 0; i < templates.length; i++) {
      var tmp_id = templates[i]._id;
      let creation_date = templates[i]._id.getTimestamp();
      templates[i].creation_date = creation_date;
      templates[i].metric = tmp_metric[tmp_id.toString()]
        ? tmp_metric[tmp_id.toString()]
        : 0;
      templates[i].last_used = last_used[tmp_id.toString()]
        ? last_used[tmp_id.toString()]
        : 0;
    }

    res.render("pages/template-dashboard", {
      title: "Templates",
      templates: templates,
      emailtemplates: user.getEmailTemplates(),
      letterTemplate: currLetterTemplate,
    });
  });
});

router.post("/delete", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.deactivateTemplate(req.body.id, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("pages/template-dashboard", {
        title: "Templates",
        templates: user.getTemplates(),
        emailtemplates: user.getEmailTemplates(),
      });
    }
  });
});

router.post("/delete-email", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.deactivateEmailTemplate(req.body.id, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("pages/template-dashboard", {
        title: "Templates",
        templates: ruser.getTemplates(),
        emailtemplates: user.getEmailTemplates(),
      });
    }
  });
});

module.exports = router;

var express = require("express");
var app = express();
var router = express.Router();
var nodemailer = require("nodemailer");
var Form = require("../models/form");
var Link = require("../models/link");
var jwt_decode = require("jwt-decode");
var User = require("../models/user");

("use strict");

/**
 * data needed to render recommender-dashboard
 */
router.get("/", async function (req, res, next) {
  //need user data
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });

  res.render("pages/recommender-dashboard", {
    title: user.displayName,
    templates: user.getTemplates(),
    email: user.email,
    subject: user.getLinkTemplateSubject(),
    body: user.getLinkTemplateBody(),
  });
});

router.post("/", async function (req, res, next) {
  //need user data
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  var currentUser = user;
  var userId = currentUser.email;
  var subject = req.body.subject_text;
  var toEmail = req.body.email;
  var body = req.body.body_text;

  Form.createForm(
    toEmail,
    currentUser.getTemplate(req.body.templateId),
    userId,
    function (err, form) {
      if (err) {
        console.log(`error: ${err}`);
      } else {
        user.addForm(form, function (err) {
          if (err) {
            console.log(`error: ${err}`);
            return;
          }
        });

        // potentially janky way to determine if local or on server
        // if $PORT is defined as 80, assume we are on the server
        // otherwise provide localhost address
        const port = process.env.PORT;

        const domain =
          port === "80" ? "recommendation.usc.edu" : "localhost:443";
        const url = encodeURI(
          "https://" + domain + "/form-entry/" + form.getLink()
        );

        const email_username = "process.env.EMAILUSER";
        const email_password = "process.env.EMAILPASS";
        const email_sender =
          "'Letter of Recommendation Generator' <" + email_username + ">";

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: email_username, // generated ethereal user
            pass: email_password, // generated ethereal password
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: email_sender, // sender address
          to: req.body.email, // list of receivers
          subject: req.body.subject_text, // Subject line
          text: req.body.body_text + " " + url, // plain text body
          html: "<p>" + req.body.body_text + " " + url + "</p>", // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

          //res.render("contact", { msg: "Email has been sent" });
        });

        res.redirect("/recommender-dashboard");
      }
    }
  );
});

router.post("/delete", async function (req, res, next) {
  //need user data
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });

  user.removeForm(req.body.id, function (err) {
    if (err) {
      console.log(err);
    } else {
      user.getForms(function (err, forms) {
        if (err) {
          console.log(`error: ${err}`);
        } else {
          res.render("pages/recommender-dashboard", {
            title: user.displayName,
            templates: user.getTemplates(),
            email: user.email,
            subject: user.getLinkTemplateSubject(),
            body: user.getLinkTemplateBody(),
          });
        }
      });
    }
  });

  user.getDeactivatedForms((err,form)=>{
    console.log("deactive form length:");
    console.log(form.length);
  });
});

router.post("/update", async function (req, res, next) {
  //need user data
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });

  user.update_linkTemplate_subject(req.body.subject, function (err) {
    if (err) {
      console.log("error in update_linkTemplate_subject: " + err);
      res.send(err);
    } else {
      user.update_linkTemplate_body(req.body.body, function (err) {
        if (err) {
          console.log("error in update_linkTemplate_body: " + err);
          res.send(err);
        } else {
          res.json({
            success: "Updated Successfully",
            status: 200,
          });
        }
      });
    }
  });
});

module.exports = router;

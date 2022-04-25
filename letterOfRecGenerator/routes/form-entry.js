var express = require("express");
var router = express.Router();
var Form = require("../models/form");
var Link = require("../models/link");
var nodemailer = require("nodemailer");
let owner_email = "";

/* GET form entry page. */
router.get("/:hash", function (req, res, next) {
  Link.findOne({ link: req.params.hash }, function (e, link) {
    //proceed to retrive form questions
    Form.findFromLink(req.params.hash, function (err, form) {
      if (err || !form) {
        res.send("Form not found.");
      } else {
        owner_email = form.owner;

        //check if the link is active
        if (!link.isActive) {
          return res.status(200).json({
            error:
              "Recommendation request has been deactivated by the owner. Please contact " +
              owner_email +
              " for further questions",
          });
        }
        //unescape question before sending to the front end
        let questions = form.getTemplate().getQuestions();
        questions.forEach(i => {
          i.question = decodeURIComponent(i.question);
        });

        res.render("pages/form-entry", {
          title:
            "Form: " +
            form.getTemplate().getName() +
            ", created " +
            form.getSent() +
            ".",
          questions: questions,
          form: form,
        });
      }
    });
  });
});

/**
 * From form-entry submitForm
 */
router.post("/", function (req, res, next) {
  Form.submitForm(req.body.id, req.body.responseData, function (err) {
    if (err) {
      console.log(err);
      res.send("unable to update responses of user form");
    } else {
      console.log("directing to completed");
      //provide email of owner of the form to the next page
      console.log(owner_email);
      sendEmail(owner_email);

      res.render("pages/form-completed", {
        title: "FORM COMPLETED",
      });
    }
  });
});

function sendEmail(email) {
  const email_username = "process.env.EMAILUSER";
  const email_password = "process.env.EMAILPASS";

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: email_username,
      pass: email_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Letter of Rec Generator" <letterrecommender@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Letter of Recommendation - Form Completed", // Subject line
    text: "A recommendee has completed your recommendation request. Please log on to the site to preview the generated letter: https://recommendation.usc.edu/ ", // plain text body
    // html: '<p>' + req.body.body_text + ' ' + url + '</p>'// html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
}

module.exports = router;

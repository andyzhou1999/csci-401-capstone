var express = require("express");
var router = express.Router();
var Form = require("../models/form");
var nodemailer = require("nodemailer");
var credentials = require("../config/auth");
var googleAuth = require("google-auth-library");
var { google } = require("googleapis");
var letterParser = require("./letter-parser");
//const HummusRecipe = require('hummus-recipe');
var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");

var fs = require("fs");
var path = require("path");
var User = require("../models/user");
var Link = require("../models/link");
var jwt_decode = require("jwt-decode");
var jwt = require("jsonwebtoken");
//const Readable = require('stream').Readable;
//const fileUpload = require('express-fileupload');
//const opn = require('opn')
//const downloadsFolder = require('downloads-folder');

//docx stuff
const docx = require("docx");
const request = require("request");
const { Document, Paragraph, Packer } = docx;

router.get("/", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.getForm(req.query.id, function (err, form) {
    if (err) {
      console.log("get /  error in letter-preivew: " + err);
      res.status(400).json({ error: "Invalid paramaters" });
    } else {
      console.log("************************");
      console.log(Array.from(user.letterTemplates.keys()));
      console.log(user.enableCustomTemplate);
      res.render("pages/letter-preview", {
        title: form.email,
        id: req.query.id,
        form: form,
        useCustom: user.enableCustomTemplate,
        letterTemplates: Array.from(user.letterTemplates.keys()),
      });
    }
  });
});

router.get("/form", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

  //retrive user obj from mongodb
  var user = await User.findOne({ email: decoded.email });
  user.getForm(req.query.id, function (err, form) {
    if (err) {
      console.log(err);
    } else {
      res.json(form);
    }
  });
});

router.post("/save", async function (req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));
  var user = await User.findOne({ email: decoded.email });
  Form.completeForm(req.body.id, req.body.letter, function (err, form) {
    if (err) {
      console.log(err);
    } else {
      res.status(200);
    }
  });
});

router.post("/prepareLetter", async function (req, res, next) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  const filePath = __dirname + "/uploads/" + "letterTemplate";
  try {
    var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));

    //retrive user obj from mongodb
    var user = await User.findOne({ email: decoded.email });
    console.log(req.body.formID);

    console.log("user:**********************");

    var pulled_text; //text that were getting and moving to docxtemplater

    //console.log(req.body.formID);
    console.log("Form link data");
    user.getForm(req.body.formID, function (err, form) {
      //decativate the link to this form
      //so student cannot change answers after letter is generated
      console.log(form.link);
      Link.findOne({ _id: form.link._id }, function (errs, link) {
        console.log("Updating link");
        console.log(link);
        link.isActive = false;
        link.save();
      });

      if (err) {
        console.log(err);
      } else {
        console.log("Form Data");
        console.log(form);
        //console.log(form.letter);
        pulled_text = form.template.text;
        res.json(form);

        console.log(parseLetter(form));

        console.log(user.templates);
        form.template.text = letterParser.htmlstuff(
          decodeLetterHTML(pulled_text)
        );

        var formatted_text = parseLetter(form);

        console.log("loading input.txt");

        var content;
        //if user choose default mode
        if (!user.useCustomTemplate) {
          content = fs.readFileSync(
            path.resolve("./routes/uploads", "input.docx"),
            "binary"
          );
        } else {
          //user use their own template
          //create a directory for this user to do file IO
          var dir = path.join(__dirname, "uploads/" + decoded.email);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          fs.writeFileSync(
            path.join(dir, "input.docx"),
            user.letterTemplates[req.body.fileName]
          );
        }

        var zip = new PizZip(content);

        var doc = new Docxtemplater();
        doc.loadZip(zip);
        //enable linebreaks
        doc.setOptions({ linebreaks: true });

        // Parse date.
        var date_raw = req.body.date;
        let actual_date = letterParser.getDate(date_raw);

        //set the templateVariables
        doc.setData({
          //text with the line breaks included
          description: formatted_text,
          date: actual_date,
          firstname: user.firstName,
          lastname: user.lastName,
          title: user.titles,
          department: user.department,
          university: user.university,
          address1: user.streetAddress,
          address2: user.address2 == "" ? "" : " ," + user.address2, // A quick hack, we need to check every field whether they are emtpy.
          city: user.city,
          state: user.statesProvinces,
          postalcode: user.postalCode,
          phonenumber: user.phone,
        });

        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          var e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
          };
          console.log(JSON.stringify({ error: e }));
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
          throw error;
        }
        var buf = doc.getZip().generate({ type: "nodebuffer" });

        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        //also do this in seperate folder to avoid multiple people trying to save letter at the same time
        var dir_ = path.join(__dirname, "uploads/" + decoded.email);
        if (!fs.existsSync(dir_)) {
          fs.mkdirSync(dir_);
        }

        fs.writeFileSync(path.resolve(dir_, "output.docx"), buf);
      }
    });
    // } ANCHOR: Try to get rid of this part
  } catch (err) {
    console.log(err);
  }
});

router.get("/downloads", function (req, res) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));
  var file = path.resolve(
    path.join(__dirname, "uploads/" + decoded.email),
    "output.docx"
  );
  res.download(file);
});

//parse the text
function parseLetter(form) {
  var tagRegex = /\<\![a-z0-9_]+\>/gi;
  var letter = form.template.text;
  var responses = form.responses;

  var noCapitalization = Array.from(
    letter
      .replace(tagRegex, function (match) {
        var response = responses.find(function (item) {
          return item.tag.localeCompare(match, { sensitivity: "base" }) == 0;
        });
        return response ? response.response : "";
      })
      .replace(tagRegex, function (match) {
        var response = responses.find(function (item) {
          return item.tag.localeCompare(match, { sensitivity: "base" }) == 0;
        });
        return response ? response.response : "";
      })
  );

  for (var i = 0; i < noCapitalization.length; i++) {
    // Found ending punctuation that isn't the last letter in the text
    if (
      (noCapitalization[i] == "." ||
        noCapitalization[i] == "?" ||
        noCapitalization[i] == "!") &&
      i != noCapitalization.length - 1
    ) {
      // Make sure exclamation point is not from a tag
      if (
        noCapitalization[i] == "!" &&
        i > 0 &&
        noCapitalization[i - 1] == "<"
      ) {
        continue;
      }

      // Look for the next alphabetical character to capitalize
      var j = i + 1;
      while (
        !(
          (noCapitalization[j] >= "a" && noCapitalization[j] <= "z") ||
          (noCapitalization[j] >= "A" && noCapitalization[j] <= "Z")
        ) &&
        j < noCapitalization.length
      ) {
        j++;
      }

      // Found character to capitalize
      if (j < noCapitalization.length) {
        noCapitalization[j] = noCapitalization[j].toUpperCase();
      }
    }
  }

  return noCapitalization.join("");
}

function decodeLetterHTML(text) {
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\<span class\="tag"\>/gi, "")
    .replace(/\<\/span\>/gi, "")
    .replace(/\<div\>/gi, "\n")
    .replace(/\<\/div\>/gi, "")
    .replace(/\<br\>/gi, "\n")
    .replace(/\&nbsp;/g, " ");
  text = text.replace(/\<strong\>\<\!/gi, "<!").replace(/\<\/strong\>/gi, "");
  text = text.replace(/\<strong\>/gi, "");
  return text;
}

module.exports = router;

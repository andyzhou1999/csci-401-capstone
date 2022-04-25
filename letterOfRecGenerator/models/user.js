var db = require("../db");
var Form = require("./form");
var Template = require("./template");
var Email = require("./email");
var Link = require("./link");

var Schema = db.Schema;

var UserSchema = new Schema({
  id: String,
  displayName: String,
  accessToken: String,
  templates: [Template.schema],
  deactivatedTemplates: [Template.schema],
  deactivatedEmailTemplates: [Email.schema],
  emailTemplates: [Email.schema],
  forms: [
    {
      type: db.Schema.Types.ObjectId,
      ref: "Form",
    },
  ],
  linkTemplate_subject: String,
  linkTemplate_body: String,
  deactivatedForms: [
    {
      type: db.Schema.Types.ObjectId,
      ref: "Form",
    },
  ],
  emailhistory: [Email.schema],
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pic:{
    type:String,
    default: "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png"
   },
  //newly added for user profile page
  firstName: String,
  lastName: String,
  middleName: String,
  university: String,
  department: String,
  titles: String,
  codes: String,
  phone: String,
  streetAddress: String,
  address2: String,
  city: String,
  statesProvinces: String,
  postalCode: String,
  country: String,
  selectedIndex: Number,
  isProfileSet: Boolean,
  enableCustomTemplate: {
    type: Boolean,
    default: false,
  },
  //map for storing multiple templates
  letterTemplates: {
    type: Map,
    of: [Number],
    default: {},
  },
});

UserSchema.statics.findUser = function (id, cb) {
  db.model("User").findOne({ id: id }, function (err, user) {
    cb(err, user);
  });
};

UserSchema.statics.createUser = function (id, cb) {
  User.create(
    {
      id: id,
      linkTemplate_subject:
        "Invitation to Fill Recommendation Letter Questionnaire",
      linkTemplate_body: "Please click the following questionnaire ",
    },
    cb
  );
};

UserSchema.statics.findOrCreate = function (id, cb) {
  UserSchema.statics.findUser(id, function (err, user) {
    if (!user) {
      console.log("user no in system");
      UserSchema.statics.createUser(id, cb);
    } else {
      console.log("user in system");
      cb(err, user);
    }
  });
};

UserSchema.methods.addTemplate = function (template, cb) {
  var errorFlag = false;
  for (var i = 0; i < this.templates.length; i++) {
    if (this.templates[i].name == template.name) {
      cb(new Error("DUPLICATE NAME"));
      errorFlag = true;
    }
  }
  if (!errorFlag) {
    this.templates.push(template);
    var newTemplate = this.templates[this.templates.length - 1];
    this.save(function (err) {
      cb(err, newTemplate.getId());
    });
  }
};

UserSchema.methods.addEmailHistory = function (email, cb) {
  this.emailhistory.push(email);
  var newTemplate = this.emailhistory[this.emailhistory.length - 1];
  this.save(function (err, id) {
    cb(err, newTemplate.getId());
  });
};

UserSchema.methods.addEmailTemplate = function (email, cb) {
  this.emailTemplates.push(email);
  var newTemplate = this.emailTemplates[this.emailTemplates.length - 1];
  this.save(function (err, id) {
    cb(err, newTemplate.getId());
  });
};

UserSchema.methods.updateEmailTemplate = function (id, email, cb) {
  var user = this;
  var updatedTemplate = this.emailTemplates.id(id);

  updatedTemplate.title = email.title;
  updatedTemplate.subject = email.subject;
  updatedTemplate.body_text = email.body_text;

  User.findOneAndUpdate(
    {
      id: user.id,
      "emailTemplates._id": id,
    },
    {
      $set: {
        "emailTemplates.$": updatedTemplate,
      },
    },
    function (err, user) {
      cb(err);
    }
  );
};

UserSchema.methods.updateTemplate = function (id, template, cb) {
  var user = this;
  var updatedTemplate = this.templates.id(id);

  updatedTemplate.name = template.name;
  updatedTemplate.text = template.text;
  updatedTemplate.questions = template.questions;
  updatedTemplate.letterheadImg = template.letterheadImg;
  updatedTemplate.footerImg = template.footerImg;
  updatedTemplate.optional = template.optional;

  User.findOneAndUpdate(
    {
      id: user.id,
      "templates._id": id,
    },
    {
      $set: {
        "templates.$": updatedTemplate,
      },
    },
    function (err, user) {
      cb(err, template);
    }
  );
};

UserSchema.methods.update_linkTemplate_subject = function (subject, cb) {
  var user = this;
  this.linkTemplate_subject = subject;
  User.findOneAndUpdate(
    {
      id: user.id,
    },
    {
      $set: {
        linkTemplate_subject: subject,
      },
    },
    function (err, user) {
      cb(err);
    }
  );
};

UserSchema.methods.update_linkTemplate_body = function (body, cb) {
  var user = this;
  this.linkTemplate_body = body;
  User.findOneAndUpdate(
    {
      id: user.id,
    },
    {
      $set: {
        linkTemplate_body: body,
      },
    },
    function (err, user) {
      cb(err);
    }
  );
};

UserSchema.methods.getTemplates = function () {
  return this.templates;
};

UserSchema.methods.getDeactivatedTemplates = function () {
  return this.deactivatedTemplates;
};

UserSchema.methods.getDeactivatedEmailTemplates = function () {
  return this.deactivatedEmailTemplates;
};

UserSchema.methods.getTemplate = function (id) {
  return this.templates.id(id);
};

UserSchema.methods.getDeactivatedTemplate = function (id) {
  return this.deactivatedTemplates.id(id);
};

UserSchema.methods.getDeactivatedEmailTemplate = function (id) {
  return this.deactivatedEmailTemplates.id(id);
};

UserSchema.methods.getEmailTemplates = function () {
  return this.emailTemplates;
};

UserSchema.methods.getEmailTemplate = function (id) {
  return this.emailTemplates.id(id);
};

UserSchema.methods.getEmailHistory = function () {
  return this.emailhistory;
};

UserSchema.methods.getAnEmailHistory = function (id) {
  return this.emailhistory.id(id);
};

UserSchema.methods.getLinkTemplateSubject = function () {
  return this.linkTemplate_subject;
};

UserSchema.methods.getLinkTemplateBody = function () {
  return this.linkTemplate_body;
};

/* This removes a specified template from templates array
and moves it to deactivatedTemplates array */
UserSchema.methods.deactivateTemplate = function (id, cb) {
  this.deactivatedTemplates.push(this.getTemplate(id));
  this.templates.pull(this.getTemplate(id));
  this.save(cb);
};

UserSchema.methods.activateTemplate = function (id, cb) {
  this.templates.push(this.getDeactivatedTemplate(id));
  this.deactivatedTemplates.pull(this.getDeactivatedTemplate(id));
  this.save(cb);
};

UserSchema.methods.deactivateEmailTemplate = function (id, cb) {
  this.deactivatedEmailTemplates.push(this.getEmailTemplate(id));
  this.emailTemplates.pull(this.getEmailTemplate(id));
  this.save(cb);
};

UserSchema.methods.activateEmailTemplate = function (id, cb) {
  this.emailTemplates.push(this.getDeactivatedEmailTemplate(id));
  this.deactivatedEmailTemplates.pull(this.getDeactivatedEmailTemplate(id));
  this.save(cb);
};

UserSchema.methods.addForm = function (form, cb) {
  this.forms.push(form._id);
  this.save(cb);
};

UserSchema.methods.getForms = function (cb, match = {}) {
  console.log(match["template"]);
  User.findOne({ _id: this._id })
    .populate({
      path: "forms",
      match,
    })
    .exec((err, user) => {
      cb(err, user.forms);
    });
};

UserSchema.methods.getForm = function (id, cb) {
  var flag = false;
  User.findOne({ _id: this._id })
    .populate({
      path: "forms",
      match: { _id: id },
    })
    .populate({
      path: "deactivatedForms",
      match: { _id: id },
    })
    .exec((err, user) => {
      if (!user || (!user.deactivatedForms && !user.forms)) {
        console.log("problem in getForm");
      } else if (user.deactivatedForms && user.deactivatedForms.length == 1) {
        cb(err, user.deactivatedForms[0]);
      } else {
        console.log("\n\nuser.forms[0]");
        console.log(user.forms[0]);
        cb(err, user.forms[0]);
      }
    });
};

UserSchema.methods.getDeactivatedForms = function (cb,match={}) {
  // try getting all forms under this user id
  User.findOne({ _id: this._id  })
    .populate({
      path: "deactivatedForms",
      match,})
    .exec(function (err, user) {
      cb(err, user.deactivatedForms);
    });
};

UserSchema.methods.getDeactivatedForm = function (id, cb) {
  User.findOne({ _id: this._id })
    .populate({
      path: "deactivatedForms",
      match: { _id: id },
    })
    .exec(function (err, user) {
      if (
        !user ||
        !user.deactivatedForms ||
        user.deactivatedForms.length != 1
      ) {
        console.log("error in getDeactForm");
      } else {
        cb(err, user.deactivatedForms[0]);
      }
    });
};
//this will put recommendation request to deactivated category and will also inactivate the link
UserSchema.methods.removeForm = function (id, cb) {
  //remove this from from active and push it to decativated
  this.forms.pull(id);
  this.deactivatedForms.push(id);

  //update the link corresponding to this form
  Form.findOne({ _id: id }, function (err, form) {
    Link.findOne({ _id: form.link._id }, function (e, link) {
      link.isActive = false;
      link.save();
    });
  });

  this.save(cb);
};

var User = db.model("User", UserSchema);

module.exports = User;

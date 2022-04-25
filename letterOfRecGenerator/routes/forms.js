var express = require('express');
var router = express.Router();
var jwt_decode = require('jwt-decode');
var User = require("../models/user")

router.get('/', async function (req, res, next) {
    //need user data
    var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));
  
    //retrive user obj from mongodb
    var user = await User.findOne({email: decoded.email});
    let template = null;
    template = user.template;
    //delete req.query.template;
    user.getForms(function(err, forms) {
        if (err) {
            console.log(`error: ${err}`);
        } else {
            if (template) {
                res.json({forms: forms.filter(form => form.template.name === template)});
            }
            else {
                res.json({forms});  
            }                     
        }
    }, req.query);
});

module.exports = router;
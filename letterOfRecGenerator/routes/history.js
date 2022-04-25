var express = require('express');
var router = express.Router();
var Form = require('../models/form');

/* GET Templates page. */
router.get('/', function (req, res, next) {
    console.log("@@@@@@@@@@@@@");
    console.log(req.query.email);
    console.log(req.user.getEmailHistory());
    res.render('pages/history', {
         title: req.query.email,
         emailHistory: req.user.getEmailHistory(),
         id: req.query.id,
     });
});

module.exports = router;
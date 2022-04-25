const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");


//this is for loading country codes, country name, states/provinces and cities.

router.get("/countryCodes", function(req, res) {

    let data = fs.readFileSync(path.join(__dirname, "country_code_and_details.json"));
    let result = JSON.parse(data);

    res.json(result);

});

// Load the names of accredited universities.
router.get("/universityList", function(req, res) {
    let data = fs.readFileSync(path.join(__dirname, "university_list.json"));
    let result = JSON.parse(data);
    res.json(result);
});

module.exports = router;

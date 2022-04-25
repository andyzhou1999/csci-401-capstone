var express = require("express");
var router = express.Router();

/* GET login page. */
router.get("/", function (req, res) {
  if (!req.user) {
    res.render("login", {
      title: "Letter of Recommendation Generator",
      subtitle: "",
      url: "/auth/google",
    });
  }

  res.render("pages/profile", {
    title: "Profile",
  });
});

module.exports = router;

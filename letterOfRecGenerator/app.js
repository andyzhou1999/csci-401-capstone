const express = require("express");
const helmet = require("helmet");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const redis = require("redis");
const client = redis.createClient();

// Passport Config
require("./config/passport")(passport);

//Email stuff

const fileUpload = require("express-fileupload");
const flash = require("connect-flash");

const createTemplate = require("./routes/template-editor");
const createEmailTemplate = require("./routes/email-template-editor");
const formCompleted = require("./routes/form-completed");
const formEntry = require("./routes/form-entry");
const letterPreview = require("./routes/letter-preview");
const login = require("./routes/login");
const recommenderDashboard = require("./routes/recommender-dashboard");
const templateDashboard = require("./routes/template-dashboard");
const users = require("./routes/users");
const archive = require("./routes/archive");
const about = require("./routes/about");
const forms = require("./routes/forms");
const api = require("./routes/api");
const response = require("./routes/response");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("./models/user");
const publicKey = fs.readFileSync(
  path.join(__dirname, "/config/jwtRS256.key.pub")
);

const app = express();

// Middleware for authentication & express
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use(
  session({
    secret: "anything",
    resave: true,
    saveUninitialized: false,
  })
);

//Connect Flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.png")));

// Routes
app.all("/", (req, res) => {
  if (req.user) {
    res.redirect("/recommender-dashboard");
  } else {
    res.redirect("/login");
  }
});
//api routing handling
app.use("/users", users);
app.use("/forms", [isAuthenticated, isProfileSet], forms);
app.use("/template-editor", [isAuthenticated, isProfileSet], createTemplate);
app.use("/form-completed", formCompleted);
app.use("/form-entry", formEntry);
app.use("/letter-preview", [isAuthenticated, isProfileSet], letterPreview);
app.use("/login", login);
app.use("/response", [isAuthenticated, isProfileSet], response);
app.use(
  "/recommender-dashboard",
  [isAuthenticated, isProfileSet],
  recommenderDashboard
);
app.use(
  "/template-dashboard",
  [isAuthenticated, isProfileSet],
  templateDashboard
);
app.use("/archive", [isAuthenticated, isProfileSet], archive);
app.use("/about", about);
app.use("/api", api);
app.use("/logout", (req, res) => {
  //add current token to redis with an expiration time
  let decoded;

  var token = req.cookies.auth;
  var needToAdd = true;

  console.log("Logging out user");
  try {
    decoded = jwt.verify(token, publicKey, {
      issuer: "Letter of Recommendation Generator",
      ignoreExpiration: false,
    });
  } catch (err) {
    //verification failed or token expired
    //we don't need to add an invalid token to redis cache
    needToAdd = false;
  }
  //valid token and we want to logout

  console.log("JWT verified");
  if (needToAdd) {
    client.set(token, token, function (err, reply) {
      //set the expiration of cache as remaing time
      client.expire(
        token,
        Math.floor(Math.max(1, decoded.exp - Date.now() / 1000))
      );
    });

    //now we will remove auth headers and go to home page
    delete req.headers.authorization;
    res.redirect("/");
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("pages/error");
});

// Sets "X-Frame-Options: DENY"
app.use(helmet.frameguard({ action: "deny" }));

//check auth header
function isAuthenticated(req, res, next) {
  //extract token
  var header = req.headers.authorization || "Bearer " + req.cookies.auth;
  var token = header.replace("Bearer ", "");
  let decoded;
  try {
    //verify the token integrity
    decoded = jwt.verify(token, publicKey, {
      issuer: "Letter of Recommendation Generator",
      ignoreExpiration: false,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }

  //set auth header
  req.headers.authorization = header;

  console.log(req.headers.authorization);
  //check if this token is invalidated by a logout request

  client.get(token, function (err, reply) {
    console.log("Find token with email of " + decoded.email);
    if (reply) {
      //user logged out, but someone try to use this unexpired token to access server
      console.log("User logged out");
      res.redirect("/");
    } else {
      //passed security check
      //next page!!!
      next();
    }
  });
}

//check if user profile is set
async function isProfileSet(req, res, next) {
  var decoded = jwt_decode(req.headers.authorization.replace("Bearer ", ""));
  var user = await User.findOne({ email: decoded.email });
  if (!user) {
    return res.redirect("/");
  }
  if (user.isProfileSet) {
    next();
  } else {
    return res.redirect("/users/profile");
  }
}

//logout the user

module.exports = app;

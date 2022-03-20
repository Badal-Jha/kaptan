const jwt = require("jsonwebtoken");
const User = require("../models/User");

//create custom route
const requireAuth = (req, res, next) => {
  //as jwt token stored in cookie
  const token = req.cookies.jwt;
  //checking if jwt exist and varified
  if (token) {
    jwt.verify(token, "badaljha secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

//check current user
const isValidUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "badaljha secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
module.exports = { requireAuth, isValidUser };

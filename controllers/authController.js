const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { handleError } = require("./handleError.js");

const maxAge = 2 * 24 * 60 * 60;
//create jwt
const createToken = (id) => {
  return jwt.sign({ id }, "badaljha secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  const _password = Buffer.from(password, "base64").toString("ascii");
  console.log(_password);
  try {
    //we can use either .save or .create
    const newUser = new User({ email, _password });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 }); //httpOnly:true so that we cannt change jwt frm frontend
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleError(err);
    res.status(500).json({ errors });
  }
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  // console.log(password, typeof password);
  const _password = Buffer.from(password, "base64").toString("ascii");
  //console.log(_password);
  try {
    //User.login() is a statics method tha we create in user model
    const user = await User.login(email, _password);
    //create and send jwt token
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  //we cant delete jwtdirectly we can replace it with empty strgin and giving a very less expiry time

  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

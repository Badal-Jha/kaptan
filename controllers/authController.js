const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { handleError } = require("./handleError.js");
const { modelNames } = require("mongoose");
const bcrypt = require("bcrypt");
const maxAge = 2 * 24 * 60 * 60;
//jwt_secret
const jwt_secret = "badaljha secret";
//create jwt
const createToken = (id) => {
  return jwt.sign({ id }, jwt_secret, {
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

  try {
    //we can use either .save or .create
    const newUser = new User({ email, password });
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

  try {
    //User.login() is a statics method tha we create in user model
    const user = await User.login(email, password);
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
//forgot password get
module.exports.forgot_get = (req, res) => {
  res.render("forgot-password");
};
//forgot password post
module.exports.forgot_post = async (req, res) => {
  const { email } = req.body;
  //check if user exists
  const user = await User.findOne({ email });

  if (user) {
    console.log("user registered");
    //create one time link

    const secret = jwt_secret + user.password;
    console.log(secret);
    const payload = {
      email: user.email,
      id: user._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: maxAge });

    const link = `http://localhost:3000/reset-password/${user._id}/${token}`;
    console.log(link);
  } else {
    console.log("user not registered");
  }
};
//reset password
module.exports.reset_get = async (req, res) => {
  const { id, token } = req.params;

  const user = await User.findById(id);

  if (user) {
    const secret = jwt_secret + user.password;
    try {
      const payload = jwt.verify(token, secret);

      res.render("reset-password", { email: user.email, id: id, token: token });
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("invalid id");
  }
};

//reset password post
module.exports.reset_post = async (req, res) => {
  console.log(req.body.password);
  const { id, token } = req.params;
  const { password } = req.body;
  const user = await User.findById(id);
  console.log(id, password);
  if (user) {
    const secret = jwt_secret + user.password;
    try {
      const payload = jwt.verify(token, secret);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      const filter = { _id: id };
      const update = { password: hashedPassword };

      let updatedUser = await User.findOneAndUpdate(filter, update, {
        new: true,
      });

      console.log("password reset");
      res.status(200).json({ user: user._id });
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("invalid id ");
  }
};

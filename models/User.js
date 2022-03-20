const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "please enter an email"], //we can provide an error
    unique: true, //we cannt provide error for this here
    lowercase: true,
    validate: [isEmail, "please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "please select the image"],
    minlength: [33, "You should select atleast 3 images"],
  },
});

//fire a function after doc saved to db

// userSchema.post("save", (doc, next) => {
//   console.log("new User was created and saved", doc);
//   next();
// });

//firea function before doc saved to db
//we are not using arrow function here as we want to use this keyword this refers to instance of user we are trying to create
userSchema.pre("save", async function (next) {
  // console.log("user about to be created as saved", this);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
  //here this refers to User model
  const user = await this.findOne({ email });

  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};
const User = mongoose.model("user", userSchema);

module.exports = User;

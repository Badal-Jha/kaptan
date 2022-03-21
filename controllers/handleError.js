module.exports.handleError = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  //email error
  if (err.message === "incorrect email") {
    errors.email = "This email is not registered";
  }

  //password
  if (err.message === "incorrect password") {
    errors.password = "Password Incorrect";
  }
  //duplicate error code
  if (err.code == 11000) {
    errors.email = "This email is already registered";
  }
  //validaton errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

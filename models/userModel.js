const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: [true, "This email is already signed up!"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valide email!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minlength: [8, "Password must contain at least 8 characters!"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);

module.exports = User;

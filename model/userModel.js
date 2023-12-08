const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  mobileNo: { type: String },
  about: { type: String },
  DOB: { type: String },
  OTP: { type: String },
  image: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("User", userSchema);

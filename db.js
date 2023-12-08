const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/chatApp")
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("DataBase is not connected", err);
  });

module.exports = mongoose;

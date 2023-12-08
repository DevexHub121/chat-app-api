const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://admin:Admin1234@cluster0.ma3xm.mongodb.net/chatApp?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("DataBase is not connected", err);
  });

module.exports = mongoose;

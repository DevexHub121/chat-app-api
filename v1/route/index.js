var express = require("express");
var router = express.Router();
const userRoute = require("./userRoute");

// router.get('/', function(req, res, next) {

// });
router.use("/user", userRoute);
module.exports = router;

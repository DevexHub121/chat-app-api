const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { upload } = require("../../utils/uploadImages");

router.post("/loginWithEmail", userController.loginWithEmail);
router.get("/getAll", userController.getAll);
router.post("/compareOTP", userController.OTP);
router.post("/userDetail", userController.userDetail);
router.post("/register", userController.register);
router.post("/message", upload.single("messageImage"), userController.message);
router.get("/getUserChat/:senderId/:receiverId", userController.getUserChat);
router.get("/getusers/:id", userController.getusers);
router.get("/getUserProfile/:id", userController.getUserProfile);
router.post("/getUserProfileEmail", userController.getUserProfileEmail);
router.post(
  "/updateProfile",
  upload.single("image"),
  userController.updateProfile
); //update user profile

// //gp
router.get("/users/:userId", userController.users);
router.post("/addUsers", upload.single("groupImage"), userController.addUsers);
router.get("/userGroup/:id", userController.userGroup);
router.post(
  "/groupChat",
  upload.single("messageImage"),
  userController.groupChat
);
router.get("/getGroupChat/:groupId", userController.getGroupChat);

// //
// router.get("/getList/:id", userController.getList); // same as getUsers
router.get("/getUserAndGroupList/:id", userController.getUserAndGroupList);
// router.get("/getUsersAndGroups/:id", userController.getUsersAndGroups);

module.exports = router;

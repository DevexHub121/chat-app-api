const User = require("../../model/userModel");
const Group = require("../../model/groupModel");
const Message = require("../../model/messageModel");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const message = require("../../utils/constants");
const mongoose = require("mongoose");

const userController = {
  //login with email
  async loginWithEmail(req, res) {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const transporter = nodemailer.createTransport({
      pool: true, // Use a pool for sending multiple emails
      host: "smtp.gmail.com",
      port: 465, // Port for secure email (TLS)
      secure: true, // Use Gmail as the email service provider
      auth: {
        user: "kanishakverdhan67@gmail.com", // Your Gmail email address
        pass: "owzfoqpvpfazvouy", // Your Gmail password or an app-specific password
      },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.error(error);
      } else {
        console.log("Email transporter is ready to send emails");
      }
    });

    const ejsFilePath = path.join(__dirname, "..", "..", "ejs", "otp.ejs");
    const template = await ejs.renderFile(ejsFilePath, { otp });
    ejs.renderFile(ejsFilePath, { otp }, (err, html) => {
      if (err) {
        console.error("EJS rendering error:", err);
      } else {
        console.log("Rendered HTML:", html);
      }
    });
    const mailOptions = {
      from: "kanishakverdhan67@gmail.com", // sender address
      to: email,
      subject: "Login OTP",
      html: template,
    };

    await User.findOne({ email: email }).then(async (userExist) => {
      if (userExist) {
        await User.findOneAndUpdate(
          { email: email },
          { OTP: otp },
          { new: true }
        ).then(() => {
          console.log("successful");
        });
      } else {
        await User.create({
          email: email,
          OTP: otp,
        });
      }

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        data: userExist,
        message: "login otp is sent.",
      });
    });
  },

  async getAll(req, res) {
    res.json({ success: true, data: "welcome" });
  },

  // compare otp to login
  async OTP(req, res) {
    await User.findOne({ email: req.body.email }).then(async (userExist) => {
      if (userExist) {
        if (req.body.otp === userExist.OTP) {
          await User.findOneAndUpdate(
            { email: req.body.email },
            { OTP: null },
            { new: true }
          );
          res.json({
            data: userExist,
          });
        } else {
          res.json({
            success: false,
            message: message.WRONG_OTP,
          });
        }
      }
    });
  },

  //getting details at otp page
  async userDetail(req, res) {
    User.findOne({ email: req.body.email }).then((userData) => {
      res.json({
        data: userData,
      });
    });
  },

  // this register is working as profile update after entering otp
  async register(req, res) {
    User.findOne({ email: req.body.email }).then(async (userExist) => {
      if (userExist) {
        const updateProfile = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          mobileNo: req.body.mobileNo,
          about: req.body.about,
          DOB: req.body.DOB,
        };

        await User.findOneAndUpdate({ email: req.body.email }, updateProfile, {
          new: true,
        }).then((userData) => {
          res.json({
            data: userData,
          });
        });
      }
    });
  },

  //get user profile
  async getUserProfile(req, res) {
    let userId = req.params.id;
    await User.findById({ _id: userId }).then((resp) => {
      res.json({
        data: resp,
      });
    });
  },

  //getUser profile with email
  async getUserProfileEmail(req, res) {
    await User.findOne({ email: req.body.email }).then((resp) => {
      res.json({
        data: resp,
      });
    });
  },

  //update user profile
  async updateProfile(req, res) {
    try {
      const updateProfile = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNo: req.body.mobileNo,
        about: req.body.about,
        DOB: req.body.DOB,
        image: "static/" + req.file.filename,
      };

      await User.findOneAndUpdate({ email: req.body.email }, updateProfile, {
        new: true,
      })
        .then((updatedData) => {
          res.status(200).json({
            data: updatedData,
            message: message.PROFILE_UPDATED,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  //get list of users to add in group
  async users(req, res) {
    await User.find({ _id: { $ne: req.params.userId } })
      .then((list) => {
        res.json({
          data: list,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  //add in gp // create group
  async addUsers(req, res) {
    let userss = req.body.users.split(",");
    userss.push(req.body.admin);
    const usersIds = userss.map((id) => new mongoose.Types.ObjectId(id));
    userss.push(req.body.admin);
    if (req.file) {
      await Group.create({
        name: req.body.name,
        admin: req.body.admin,
        users: usersIds,
        groupImage: "static/" + req.file.filename,
      }).then((details) => {
        res.json({
          data: details,
        });
      });
    } else {
      await Group.create({
        name: req.body.name,
        admin: req.body.admin,
        users: usersIds,
      }).then((details) => {
        res.json({
          data: details,
        });
      });
    }
  },

  //chat one to one
  async message(req, res) {
    try {
      const sender = await User.findById(req.body.sender);
      const receiver = await User.findById(req.body.receiver);
      if (!sender || !receiver) {
        return res.status(404).send("Sender or receiver not found");
      }

      if (req.files.length > 0) {
        const newMessage = new Message({
          sender: req.body.sender,
          receiver: req.body.receiver,
          message: req.body.message,
          messageImage: req.files.map((file) => "static/" + file.filename),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await newMessage
          .save()
          .then((result) => {
            res.json({
              success: true,
              data: result,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        const newMessage = new Message({
          sender: req.body.sender,
          receiver: req.body.receiver,
          message: req.body.message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await newMessage
          .save()
          .then((result) => {
            res.json({
              success: true,
              data: result,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch {
      console.log("error");
    }
  },

  //get one to one chat
  async getUserChat(req, res) {
    const userId1 = req.params.senderId;
    const userId2 = req.params.receiverId;

    try {
      const messages = await Message.find({
        $or: [
          { sender: userId1, receiver: userId2 },
          { sender: userId2, receiver: userId1 },
        ],
      }).sort({ createdAt: "asc" });
      // .populate('sender', 'firstName') // populate sender details with only the username
      // .populate('receiver', 'firstName') // populate receiver details with only the username
      // .exec();

      res.json({
        data: messages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  // get users with whome having chat
  async getusers(req, res) {
    const userId = req.params.id;

    try {
      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      });

      const chatUserIds = new Set();

      messages.forEach((message) => {
        chatUserIds.add(message.sender.toString());

        // Check if the receiver exists before adding to the set
        if (message.receiver) {
          chatUserIds.add(message.receiver.toString());
        }
      });

      const chatUsers = Array.from(chatUserIds);

      const index = chatUsers.indexOf(userId);
      if (index !== -1) {
        chatUsers.splice(index, 1);
      }

      const users = await Promise.all(
        chatUsers.map(async (chatUserId) => {
          const lastMessage = await Message.find({
            $or: [
              { sender: userId, receiver: chatUserId },
              { sender: chatUserId, receiver: userId },
            ],
          })
            .sort({ createdAt: "desc" })
            .limit(1);

          const user = await User.findById(
            chatUserId,
            "email createdAt firstName lastName"
          );

          return {
            user,
            lastMessage: lastMessage[0] || null,
          };
        })
      );

      // Sort the users based on the latest message's createdAt
      users.sort((a, b) => {
        return (
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        );
      });

      res.json({
        data: users,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).send("Internal server error");
    }
  },

  // chat in group

  async groupChat(req, res) {
    try {
      if (req.files.length > 0) {
        const newMessage = new Message({
          sender: req.body.sender,
          groupId: req.body.groupId,
          message: req.body.message,
          messageImage: req.files.map((file) => "static/" + file.filename),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          //   receiver: "",
        });

        await newMessage.save().then((resp) => {
          res.json({
            data: resp,
          });
        });
      } else {
        const newMessage = new Message({
          sender: req.body.sender,
          groupId: req.body.groupId,
          message: req.body.message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          //   receiver: "",
        });

        await newMessage.save().then((resp) => {
          res.json({
            data: resp,
          });
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  },

  // get user

  //get list of user's group
  async userGroup(req, res) {
    const userId = req.params.id;
    // try {
    //   const groups = await Group.find({ users: userId })
    //     .sort({ createdAt: "desc" })
    //     .populate("admin", "email firstName lastName")
    //     .exec();

    //   res.json({ data: groups });
    // } catch (error) {
    //   console.error("Error finding groups:", error);
    //   res.status(500).send("Internal server error");
    // }
    try {
      const groups = await Group.find({ users: userId })
        .populate("admin", "firstName lastName email mobileNo about")
        .exec();

      const groupListWithMessages = await Promise.all(
        groups.map(async (group) => {
          const latestMessage = await Message.findOne({ groupId: group._id })
            .sort({ createdAt: "desc" })
            .exec();

          return {
            group,
            latestMessage,
          };
        })
      );

      if (groupListWithMessages) {
        groupListWithMessages.sort((a, b) => {
          if (a && b) {
            if (a.latestMessage && b.latestMessage) {
              if (a.latestMessage.createdAt && b.latestMessage.createdAt) {
                return (
                  b.latestMessage.createdAt.getTime() -
                  a.latestMessage.createdAt.getTime()
                );
              }
            }
          }
        });
      }
      // groupListWithMessages.sort((a, b) => {
      //   return (
      //     b.latestMessage.createdAt.getTime() -
      //     a.latestMessage.createdAt.getTime()
      //   );
      // });

      res.json({
        data: groupListWithMessages,
      });
    } catch (error) {
      console.error("Error fetching group list:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  ///get list user group

  // async getList(req, res) {
  //     const userId = req.params.id;

  //     try {
  //         // Step 1: Get group details
  //         const groups = await Group.find({ users: userId });

  //         const groupIds = groups.map((group) => group._id);

  //         // Step 2: Get last message for each group ordered by createdAt
  //         const lastMessages = await Message.aggregate([{
  //                 $match: {
  //                     groupId: { $in: groupIds },
  //                 },
  //             },
  //             {
  //                 $sort: { createdAt: -1 },
  //             },
  //             {
  //                 $group: {
  //                     _id: '$groupId',
  //                     lastMessage: { $first: '$$ROOT' },
  //                 },
  //             },
  //             {
  //                 $replaceRoot: { newRoot: '$lastMessage' },
  //             },
  //         ]);

  //         // Attach group details to each message
  //         const messagesWithGroupDetails = lastMessages.map((message) => {
  //             const groupDetail = groups.find((group) => group._id.equals(message.groupId));
  //             return {
  //                 ...message,
  //                 groupDetails: groupDetail,
  //             };
  //         });

  //         res.json({ data: messagesWithGroupDetails });
  //     } catch (error) {
  //         console.error('Error finding groups and last messages:', error);
  //         res.status(500).send('Internal server error');
  //     }
  // },

  //combine api //not working
  async getUserAndGroupList(req, res) {
    const userId = req.params.id;

    try {
      // Fetching users and last messages
      const userMessages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      });

      const chatUserIds = new Set();
      userMessages.forEach((message) => {
        chatUserIds.add(message.sender.toString());
        chatUserIds.add(message.receiver.toString());
      });

      const chatUsers = Array.from(chatUserIds);

      const index = chatUsers.indexOf(userId);
      if (index !== -1) {
        chatUsers.splice(index, 1);
      }

      const users = await Promise.all(
        chatUsers.map(async (chatUserId) => {
          const user = await User.findById(chatUserId, "email");
          const lastMessage = await Message.find({
            $or: [
              { sender: userId, receiver: chatUserId },
              { sender: chatUserId, receiver: userId },
            ],
          })
            .sort({ createdAt: "desc" })
            .limit(1);

          return {
            user,
            lastMessage: lastMessage[0] || null,
          };
        })
      );

      // Sorting users based on the latest message's createdAt
      users.sort(
        (a, b) =>
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      );

      // Fetching groups
      const groups = await Group.find({ users: userId });

      // Sorting groups based on the latest message's createdAt
      groups.sort(
        (a, b) =>
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      );

      res.json({
        userData: users,
        groupData: groups,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).send("Internal server error");
    }
  },

  //get group chat
  async getGroupChat(req, res) {
    const groupId = req.params.groupId;

    try {
      const messages = await Message.find({ groupId }).sort({
        createdAt: "asc",
      });

      res.json({
        data: messages,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).send("Internal server error");
    }
  },

  //
};

module.exports = userController;

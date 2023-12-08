const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: { type: String },
  messageImage: [{ type: String }],
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Message", messageSchema);

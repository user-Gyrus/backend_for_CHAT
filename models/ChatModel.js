const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);

const message = mongoose.model("Message", messageSchema);

module.exports = message;

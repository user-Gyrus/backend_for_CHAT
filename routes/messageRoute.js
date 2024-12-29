const express = require("express");
const Message = require("../models/ChatModel");
const { protect } = require("../middleware/authMiddleware");

const messageRouter = express.Router();

//send a message
messageRouter.post("/", protect, async (request, response) => {
  try {
    const { content, groupId } = request.body;
    const message = await Message.create({
      sender: request.user._id,
      content,
      group: groupId,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );
    response.json(populatedMessage);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

//get all messages from the group
messageRouter.get("/:groupId", protect, async (request, response) => {
  try {
    const messages = await Message.find({
      group: request.params.groupId,
    })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });
    response.json(messages);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});
module.exports = messageRouter;

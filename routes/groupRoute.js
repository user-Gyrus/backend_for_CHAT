const express = require("express");
const Group = require("../models/GroupModel");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const groupRouter = express.Router();

//create a new group
groupRouter.post("/", protect, isAdmin, async (request, response) => {
  try {
    const { name, description } = request.body;
    const group = await Group.create({
      name,
      description,
      admin: request.user._id,
      members: [request.user._id],
    });
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
    response.status(201).json({ populatedGroup });
  } catch (error) {
    console.log(error);

    response.status(400).json({ message: error.message });
  }
});

//get all groups available
groupRouter.get("/", protect, async (request, response) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email");
    response.json(groups);
  } catch (error) {
    response.json({ message: error.message });
  }
});

//joining a group
groupRouter.post("/:groupId/join", protect, async (request, response) => {
  try {
    const group = await Group.findById(request.params.groupId);
    if (!group) {
      return response.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(request.user._id)) {
      return response
        .status(400)
        .json({ message: "Already a member of this group" });
    }
    group.members.push(request.user._id);
    await group.save();
    response.json({ message: "Successfully joined the group" });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

groupRouter.post("/:groupId/leave", protect, async (request, response) => {
  try {
    const group = await Group.findById(request.params.groupId);
    if (!group) {
      return response.status(404).json({ message: "Group Not Found" });
    }
    if (!group.members.includes(request.user._id)) {
      return response
        .status(400)
        .json({ message: "You are not a member of this group." });
    }
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== request.user._id.toString()
    );
    await group.save();
    response.json({ message: "Successfully left the group" });
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});
module.exports = groupRouter;

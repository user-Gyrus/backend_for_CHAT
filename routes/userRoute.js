const express = require("express");
const userRouter = express.Router();
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

//register route
userRouter.post("/register", async (request, response) => {
  try {
    const { username, email, password } = request.body;
    //check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return response.status(400).json({ message: "User already Exists" });
    }
    //else create the new user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      response
        .status(201)
        .json({ _id: user._id, username: user.username, email: user.email });
    }
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

//login route
userRouter.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPass(password))) {
      response.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        },
      });
    } else {
      response.status(401).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
});

//generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = userRouter;

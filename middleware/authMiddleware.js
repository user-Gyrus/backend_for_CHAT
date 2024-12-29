const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (request, response, next) => {
  //get the token from the user first
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = request.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      response.status(401).json({ message: "UnAuthorized" });
    }
  }

  if (!token) {
    response.status(401).json({ message: "UnAuthorized, Token not found" });
  }
};

const isAdmin = async (request, response, next) => {
  try {
    if (request.user && request.user.isAdmin) {
      next();
    } else {
      response.status(403).json({ message: "UnAuthorized, Admin Only" });
    }
  } catch (error) {}
};

module.exports = { protect, isAdmin };

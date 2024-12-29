const socket = (io) => {
  //store the connected users
  const connectedUsers = new Map();
  io.on("connection", (socket) => {
    //get user from authentication
    const user = socket.handshake.auth.user;

    //!START: Join room handler
    socket.on("join room", (groupId) => {
      //add socket to the specified room
      socket.join(groupId);

      connectedUsers.set(socket.id, { user, room: groupId });
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      io.in(groupId).emit("users in room", usersInRoom);

      socket.to(groupId).emit("notification", {
        type: "USER_JOIN",
        message: `${user && user.username} has joined`,
        user: user,
      });
    });
    //!END: Join room handler
    //? ---------------
    //!START: Leave room handler
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving the room: `, groupId);
      //remove socket
      socket.leave(groupId);

      if (connectedUsers.has(socket.id)) {
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });
    //!END: Leave room handler
    //? ---------------
    //!START:  New Message handler
    socket.on("new message", (message) => {
      //broadcast message to all users
      socket.to(message.groupId).emit("Message Received", message);
    });
    //!END: New Message  handler
    //? ---------------
    //!START: Disconnected handler
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);
      if (connectedUsers.has(socket.id)) {
        const userData = connectedUsers.get(socket.id);

        socket.to(userData.room).emit("user left", user._id);

        connectedUsers.delete(socket.id);
      }
    });
    //!END: Disconnected handler
    //? ---------------
    //!START: Typing handler
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      socket
        .to(groupId)
        .emit("user stopped typing", { username: user?.username });
    });
    //!END: Typing handler
  });
};

module.exports = socket;

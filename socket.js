const socket = (io) => {
  //store the connected users
  const connectedUsers = new Map();
  io.on("connection", (socket) => {
    //get user from authentication
    const user = socket.handshake.auth.user;

    //!START: Join room handler
    socket.on("join room", (groupId) => {
      // Add socket to the specified room
      socket.join(groupId);

      connectedUsers.set(socket.id, { room: groupId, user: user });

      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      io.in(groupId).emit("users in room", usersInRoom);

      io.in(groupId).emit("room member count", usersInRoom.length);

      socket.to(groupId).emit("notification", {
        type: "USER_JOIN",
        message: `${user?.username} has joined`,
        user: user,
      });
    });

    //!END: Join room handler

    //? ---------------
    //!Start : Leave Room Handler
    socket.on("leave room", (groupId) => {
      const userData = connectedUsers.get(socket.id);

      if (!userData) {
        console.log(`No user data found for socket: ${socket.id}`);
        return;
      }

      console.log(`${userData.user.username} is leaving the room: `, groupId);

      if (connectedUsers.has(socket.id)) {
        socket.leave(groupId);
        connectedUsers.delete(socket.id);

        // Re-calculate users in the room and emit the count
        const usersInRoom = Array.from(connectedUsers.values())
          .filter((u) => u.room === groupId)
          .map((u) => u.user);

        io.in(groupId).emit("users in room", usersInRoom);
        io.in(groupId).emit("room member count", usersInRoom.length);

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
    //!START: Disconnect handler
    socket.on("disconnect", () => {
      const userData = connectedUsers.get(socket.id);

      if (!userData) {
        return;
      }

      const groupId = userData.room;
      connectedUsers.delete(socket.id);

      // Re-calculate users in the room and emit the count
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      io.in(groupId).emit("users in room", usersInRoom);
      io.in(groupId).emit("room member count", usersInRoom.length);

      socket.to(groupId).emit("user left", userData?.user?._id);
    });
    //!END: Disconnect handler
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

    //!START: Send message handler
    socket.on("send message", (message) => {
      // Handle message sending logic here
      // For instance, save the message to a database, then broadcast it

      // Assuming message contains the groupId and message content
      console.log(`Message to group ${message.groupId}: ${message.content}`);

      // Broadcast the message to the group (excluding the sender)
      socket.to(message.groupId).emit("message received", message);
    });
    //!END: Send message handler
  });
};

module.exports = socket;

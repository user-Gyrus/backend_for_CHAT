const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoute");
const socketio = require("socket.io");
const cors = require("cors");
const socketIo = require("./socket");
const groupRouter = require("./routes/groupRoute");
const messageRouter = require("./routes/messageRoute");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173"], // Adjust this for your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to the database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Corrected option
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 30000,
  })
  .then(() => {
    console.log(`Connection established with the database`);
  })
  .catch((err) => {
    console.log(`Connection with database failed`, err);
  });

// Initialize the socket
socketIo(io);

app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

// Start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`The server is live at http://localhost:${PORT}`);
});

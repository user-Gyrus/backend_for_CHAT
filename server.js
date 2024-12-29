const express = require("express");
const http = require("http");
const dotnev = require("dotenv");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoute");
const socketio = require("socket.io");
const cors = require("cors");
const socketIo = require("./socket");
const groupRouter = require("./routes/groupRoute");
const messageRouter = require("./routes/messageRoute");
dotnev.config();

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//middlewares
app.use(cors());
app.use(express.json());
//connect to the database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTsopology: true,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 30000,
  })
  .then(() => {
    console.log(`Connection Establised with the Database`);
  })
  .catch((err) => {
    console.log(`Connection with database failed`, err);
  });

//initialise the socket
socketIo(io);

app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

//start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`The server is live at http://localhost:${PORT}`);
});

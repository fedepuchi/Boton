const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Allow frontend to connect (update FRONTEND_URL in production)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Pulso backend running 🔴" });
});

// Global state stored in memory
let state = {
  count: 0,
  lastPressed: null,
  lastMessage: null,
};

const MESSAGES = [
  "PUTO EL QUE LEE",
  "UN PUTO TOCO EL BOTON"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Send current state to the new user
  socket.emit("state", state);

  // When a user presses the button
  socket.on("press", () => {
    state.count += 1;
    state.lastPressed = Date.now();
    state.lastMessage = getRandom(MESSAGES);

    console.log(`🔴 Button pressed! Total: ${state.count}`);

    // Broadcast to ALL other users (not the one who pressed)
    socket.broadcast.emit("someone_pressed", {
      count: state.count,
      lastPressed: state.lastPressed,
      message: state.lastMessage,
    });

    // Confirm back to the user who pressed
    socket.emit("press_confirmed", {
      count: state.count,
      lastPressed: state.lastPressed,
      message: state.lastMessage,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Pulso backend running on port ${PORT}`);
});

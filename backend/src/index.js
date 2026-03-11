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
  count: 360,
  lastPressed: null,
  lastMessage: null,
};

const MILESTONES = {
  400: "🎉 ¡400 pulsaciones! ",
  500: "🌍 ¡500 pulsaciones! ",
  600: "✨ ¡600 pulsaciones! ",
  750: "💫 ¡750 pulsaciones! ",
  1000: "🚀 ¡1000 pulsaciones! ",
};

const MESSAGES = [
  "UN FUCKING GUY PRESSED THE BUTTON",
  "一个他妈的家伙按了按钮",
  "UN FOTTUTO TIZIO HA PREMUTO IL PULSANTE",
  "UM FILHO DA PUTA APERTOU O BOTÃO",
  "UN PUTAIN DE MEC A APPUYÉ SUR LE BOUTON",
  "КАКОЙ-ТО ЧЕРТОВ ПАРЕНЬ НАЖАЛ КНОПКУ",
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

    // Check if it's a milestone
    const milestoneMsg = MILESTONES[state.count] || null;

    console.log(`🔴 Button pressed! Total: ${state.count}`);

    // Broadcast to ALL other users (not the one who pressed)
    socket.broadcast.emit("someone_pressed", {
      count: state.count,
      lastPressed: state.lastPressed,
      message: state.lastMessage,
      milestone: milestoneMsg,
    });

    // Confirm back to the user who pressed
    socket.emit("press_confirmed", {
      count: state.count,
      lastPressed: state.lastPressed,
      message: state.lastMessage,
      milestone: milestoneMsg,
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

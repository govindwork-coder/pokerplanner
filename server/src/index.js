const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { customAlphabet } = require("nanoid");
const rm = require("./roomManager");

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ─── REST: Create Room ───────────────────────────────────────────────────────
app.post("/api/rooms", (req, res) => {
  const { hostName } = req.body;
  if (!hostName) return res.status(400).json({ error: "hostName required" });

  const roomId = nanoid();
  rm.createRoom(roomId, hostName);
  res.json({ roomId });
});

// ─── REST: Check Room Exists ─────────────────────────────────────────────────
app.get("/api/rooms/:roomId", (req, res) => {
  const room = rm.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ exists: true });
});

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // Join an existing room
  socket.on("join-room", ({ roomId, name, isHost }) => {
    const room = rm.getRoom(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    rm.addParticipant(roomId, socket.id, name, isHost);
    socket.join(roomId);
    socket.data.roomId = roomId;
    io.to(roomId).emit("room-update", rm.getSafeRoom(roomId));
    console.log(`[join] ${name} → ${roomId}`);
  });

  // Host adds an issue
  socket.on("add-issue", ({ roomId, title }) => {
    const room = rm.addIssue(roomId, title);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Participant casts a vote
  socket.on("vote", ({ roomId, value }) => {
    const room = rm.castVote(roomId, socket.id, value);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Host reveals all votes
  socket.on("reveal-votes", ({ roomId }) => {
    const room = rm.revealVotes(roomId);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Host moves to next issue
  socket.on("next-issue", ({ roomId }) => {
    const room = rm.nextIssue(roomId);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Host resets votes for the same issue
  socket.on("play-again", ({ roomId }) => {
    const room = rm.playAgain(roomId);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Host accepts the round result and advances
  socket.on("accept-round", ({ roomId, result }) => {
    const room = rm.acceptRound(roomId, result);
    if (room) io.to(roomId).emit("room-update", room);
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = rm.removeParticipant(roomId, socket.id);
      if (room) io.to(roomId).emit("room-update", room);
    }
    console.log(`[disconnect] ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const rooms = {};

function createRoom(roomId, hostName) {
  rooms[roomId] = {
    id: roomId,
    host: hostName,
    participants: {},   // { socketId: { name, vote, isHost } }
    issues: [],         // [{ id, title, result }]
    currentIssueIndex: 0,
    revealed: false,
  };
  return rooms[roomId];
}

function getRoom(roomId) {
  return rooms[roomId] || null;
}

function deleteRoom(roomId) {
  delete rooms[roomId];
}

function addParticipant(roomId, socketId, name, isHost = false) {
  if (!rooms[roomId]) return null;
  rooms[roomId].participants[socketId] = { name, vote: null, isHost };
  return rooms[roomId];
}

function removeParticipant(roomId, socketId) {
  if (!rooms[roomId]) return null;
  delete rooms[roomId].participants[socketId];
  // If no one left, delete the room
  if (Object.keys(rooms[roomId].participants).length === 0) {
    deleteRoom(roomId);
    return null;
  }
  return rooms[roomId];
}

function addIssue(roomId, title) {
  if (!rooms[roomId]) return null;
  const issue = { id: Date.now().toString(), title, result: null };
  rooms[roomId].issues.push(issue);
  return rooms[roomId];
}

function castVote(roomId, socketId, value) {
  if (!rooms[roomId]) return null;
  if (!rooms[roomId].participants[socketId]) return null;
  rooms[roomId].participants[socketId].vote = value;
  return rooms[roomId];
}

function revealVotes(roomId) {
  if (!rooms[roomId]) return null;
  rooms[roomId].revealed = true;
  return rooms[roomId];
}

function nextIssue(roomId) {
  if (!rooms[roomId]) return null;
  const room = rooms[roomId];
  Object.keys(room.participants).forEach((sid) => {
    room.participants[sid].vote = null;
  });
  room.revealed = false;
  room.currentIssueIndex = Math.min(
    room.currentIssueIndex + 1,
    room.issues.length - 1
  );
  return room;
}

// Reset votes for the same issue (Play again)
function playAgain(roomId) {
  if (!rooms[roomId]) return null;
  const room = rooms[roomId];
  Object.keys(room.participants).forEach((sid) => {
    room.participants[sid].vote = null;
  });
  room.revealed = false;
  return room;
}

// Save final result for current issue, then advance
function acceptRound(roomId, result) {
  if (!rooms[roomId]) return null;
  const room = rooms[roomId];
  if (room.issues[room.currentIssueIndex]) {
    room.issues[room.currentIssueIndex].result = result;
  }
  Object.keys(room.participants).forEach((sid) => {
    room.participants[sid].vote = null;
  });
  room.revealed = false;
  room.currentIssueIndex = Math.min(
    room.currentIssueIndex + 1,
    room.issues.length - 1
  );
  return room;
}

function getSafeRoom(roomId) {
  const room = getRoom(roomId);
  if (!room) return null;
  return room;
}

module.exports = {
  createRoom,
  getRoom,
  deleteRoom,
  addParticipant,
  removeParticipant,
  addIssue,
  castVote,
  revealVotes,
  nextIssue,
  playAgain,
  acceptRound,
  getSafeRoom,
};

var socket = io({
  reconnection: false
});

const roomId = document.getElementById("room").getAttribute("data-roomId");
const playerId = document.getElementById("playerDetails").getAttribute("data-playerId");
const playerIsHost = document.getElementById("playerDetails").getAttribute("data-host");

socket.on("connect", () => {
  socket.emit("join", {
    roomId,
    host: playerIsHost,
    playerId: playerId,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
socket.on("roomChange", (player) => {
  //    console.log(`New player ${player.playerId} has joined the room`)
  htmx.ajax("GET", `/api/rooms/${roomId}`, {
    target: "#room",
    swap: "outerHTML"
  });
});

socket.on("gameStarted", (startTime) => {
  htmx.ajax("GET", `/api/rooms/${roomId}/start`, {
    target: "#room",
    swap: "outerHTML",
    values: {
      startTime
    }
  })
})

import { updatePlayerPosition } from "./Game.js";
import gameStartEvent from "./Events/gameStart.js";

const socket = io({ reconnection: false });
window.socket = socket

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

socket.on("roomChange", () => {
  htmx.ajax("GET", `/api/rooms/${roomId}`, {
    target: "#room",
    swap: "outerHTML"
  });
});


socket.on("gameStarted", (startTime) => {
  const startButton = document.getElementById("startButton");
  const copyLinkButton = document.getElementById("copyLinkButton");

  // One implies the other
  if (startButton) {
    startButton.setAttribute("hidden", true);
    copyLinkButton.setAttribute("hidden", true);
  }

  const countdownDisplay = document.getElementById("countdown-wpm");
  const countdown = setInterval(() => {
    const timeRemaining = startTime - Date.now();
    if (timeRemaining <= 0) {
      window.startTime = startTime
      const textbox = document.getElementById("textbox");
      textbox.dispatchEvent(gameStartEvent);

      countdownDisplay.textContent = "WPM: 0";
      clearInterval(countdown);
      return;
    }
    countdownDisplay.textContent = `:${String(Math.floor(timeRemaining / 1000)).padStart(2, '0')}`;
  }, 1000);
});

// calling updatePlayerPosition directly doesn't work here,
// and neither does passing progressUpdateData directly as an object
socket.on("progressUpdate", (progressUpdateData) => {
  const { playerId, progress, wpm, finished } = progressUpdateData;
  updatePlayerPosition(playerId, progress, wpm, finished)
});

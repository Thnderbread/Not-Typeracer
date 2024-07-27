/* eslint-disable @typescript-eslint/no-unused-vars */
function startGame() {
  if ("<%= currentPlayer.host %>") {
    socket.emit("startGame")
  }
}

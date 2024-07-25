import type { Socket } from "socket.io";
// import type { IPlayer } from "./types/game-interface";

function socketIoHandler(socket: Socket) {
  socket.on("join", (data) => {
    // socket.host = data.playerIsHost;
    socket.join(data.room);
    socket.to(data.room).emit("joined", data.player);
  });

  // Set up sending progress data to other room members

  // set up receiving progress data
  // socket.on("progress", (data) => {
  //   socket.to(data.room).emit("progress-update", data);
  // });
}

export default socketIoHandler;

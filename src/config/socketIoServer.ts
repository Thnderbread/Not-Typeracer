import { type Server as httpServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import {
  handleSocketIncomingProgress,
  handleSocketDisconnect,
  handleSocketStartGame,
  handleSocketJoin,
} from "./socketIoHandlers";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socketio-types";

function initSocketIoServer(httpServer: httpServer) {
  const io = new SocketIoServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  io.on("connection", (socket) => {
    socket.on("join", handleSocketJoin.bind(socket));
    socket.on("incomingProgress", handleSocketIncomingProgress.bind(socket));

    socket.on("disconnect", async (reason) => {
      const roomId = await handleSocketDisconnect.call(socket);

      roomId && io.to(roomId).emit("roomChange");
      console.log(`Socket disconnected: ${reason}`);
    });

    socket.on("startGame", async () => {
      const roomId = await handleSocketStartGame.call(socket);

      const startTime = Date.now() + 10_000;
      roomId && io.to(roomId).emit("gameStarted", startTime);
    });
  });

  return io;
}

export default initSocketIoServer;

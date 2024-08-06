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
    socket.on("incomingProgress", async (progressData) => {
      const info = await handleSocketIncomingProgress.call(
        socket,
        progressData
      );
      if (!info) return;
      io.to(progressData.roomId).emit("progressUpdate", info);
    });

    socket.on("disconnect", async () => {
      const roomId = await handleSocketDisconnect.call(socket);

      roomId && io.to(roomId).emit("roomChange");
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

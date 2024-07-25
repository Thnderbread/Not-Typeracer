import RoomDao from "./helpers/roomDao";
import { type Server as httpServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./types/socketio-types";

function initSocketIoServer(httpServer: httpServer) {
  const io = new SocketIoServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  io.on("connection", (socket) => {
    socket.on("join", (joinData) => {
      socket.data.roomId = joinData.roomId;
      socket.data.host = joinData.playerIsHost;
      socket.data.playerId = joinData.playerId;

      // console.log(`Someone joined: ${JSON.stringify(joinData)}`);
      socket.join(joinData.roomId);
      socket.to(joinData.roomId).emit("roomChange", joinData.playerId);
    });

    // send new progress level to all users
    socket.on("incomingProgress", (progressData) => {
      const { playerId } = socket.data;
      const { progress } = progressData;

      socket
        .to(progressData.roomId)
        .emit("outgoingProgress", { playerId, progress });
    });

    // remove user from the room on disconnect
    socket.on("disconnect", async (reason) => {
      const { roomId } = socket.data;
      const game = await RoomDao.getRoom(roomId);

      if (!game) {
        console.warn("Couldn't find the game with this user.");
        return;
      }

      game.players = game.players.filter(
        (player) => player.playerId !== socket.data.playerId
      );

      // destroy the room if no one is left in it
      game.players.length === 0
        ? await RoomDao.destroyRoom(roomId)
        : await RoomDao.setRoom(roomId, game);

      io.to(roomId).emit("roomChange");
      console.log(`Socket disconnected: ${reason}`);
    });
  });

  return io;
}

export default initSocketIoServer;

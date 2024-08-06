import RoomDao from "../helpers/roomDao";
import type {
  IncomingProgressData,
  JoinEventData,
  OutgoingProgressData,
  SocketType,
} from "../types/socketio-types";

/** Handler for a socket joining a room, NOT a connection joining the server. */
export function handleSocketJoin(this: SocketType, joinData: JoinEventData) {
  this.data.host = joinData.host;
  this.data.roomId = joinData.roomId;
  this.data.playerId = joinData.playerId;

  this.join(joinData.roomId);
  this.to(joinData.roomId).emit("roomChange", joinData.playerId);
}

/** Handler for incoming progress data from a socket. */
export async function handleSocketIncomingProgress(
  this: SocketType,
  progressData: IncomingProgressData
): Promise<OutgoingProgressData | undefined> {
  const { playerId } = this.data;
  const { progress, roomId, wpm } = progressData;

  const game = await RoomDao.getRoom(roomId);
  if (!game) {
    console.warn("Couldn't find game for this user.");
    return;
  }
  if (progress === 100) {
    game.finished += 1;
    await RoomDao.setRoom(roomId, game);
  }

  return {
    finished: game.finished,
    playerId,
    progress,
    wpm,
  };
}

/** Handler for a socket that is disconnected.
 *
 * @returns the roomId from which the socket disconnected for further processing.
 */
export async function handleSocketDisconnect(this: SocketType) {
  const { roomId } = this.data;
  const game = await RoomDao.getRoom(roomId);

  if (!game) {
    console.warn("Couldn't find the game with this user.");
    return;
  }

  game.players = game.players.filter(
    (player) => player.playerId !== this.data.playerId
  );

  // destroy the room if no one is left in it
  game.players.length === 0
    ? await RoomDao.destroyRoom(roomId)
    : await RoomDao.setRoom(roomId, game);

  return roomId;
}

/**
 *  Handler for a request to start the game.
 * @returns the roomId to which the socket belongs for further processing.
 */
export async function handleSocketStartGame(this: SocketType) {
  if (!this.data.host) {
    console.warn("Start attempt by non-host player denied.");
    return;
  }

  const { roomId } = this.data;
  const game = await RoomDao.getRoom(roomId);

  if (!game) {
    console.warn("Could not find the game the user requested.");
    return;
  }

  if (game.started) {
    console.warn("Attempt to start a game that is already in progress.");
    return;
  }

  game.started = true;
  await RoomDao.setRoom(roomId, game);
  return roomId;
}

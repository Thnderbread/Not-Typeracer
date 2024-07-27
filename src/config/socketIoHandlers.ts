import RoomDao from "../helpers/roomDao";
import type {
  IncomingProgressData,
  JoinEventData,
  SocketType,
} from "../types/socketio-types";

/** Handler for a socket joining a room, NOT a connection joining the server. */
export function handleSocketJoin(this: SocketType, joinData: JoinEventData) {
  this.data.roomId = joinData.roomId;
  this.data.host = joinData.playerIsHost;
  this.data.playerId = joinData.playerId;

  console.log(`Someone joined: ${JSON.stringify(joinData)}`);
  this.join(joinData.roomId);
  this.to(joinData.roomId).emit("roomChange", joinData.playerId);
}

/** Handler for incoming progress data from a socket. */
export function handleSocketIncomingProgress(
  this: SocketType,
  progressData: IncomingProgressData
) {
  const { playerId } = this.data;
  const { progress } = progressData;

  this.to(progressData.roomId).emit("outgoingProgress", { playerId, progress });
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

/** Handler for a request to start the game.
 *
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

  return roomId;
}

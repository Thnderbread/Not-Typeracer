import type { Connection } from "sockjs";
import type { IPlayer } from "./interfaces/game-interface";

// Move to config file
const PLAYER_LIMIT = 4;
const rooms = new Map();

function wssHandler(ws: Connection) {
  // this is for either creating or joining a room.
  // so, if there's no room id sent in this request, it must be creating.
  // in which case, just add a new id to another id and give it back to client
  // if there is a room id, add the user to that room (if it's not full.)
  // if each ws is a new person / player / client, then they should be a child value of the room id.
  /**
   * accept game id
   * accept player id
   * accept progress number
   * find game id in map
   * current = games[gameId]
   * update player progress level for that room
   * current[playerId].progress = progressNumber
   * propagate that information to all clients
   */

  console.log(`the ws: ${JSON.stringify(ws)} | and its id: ${ws.id} `);
  // get the room they're trying to join
  const room = rooms.get(ws);
  if (room === undefined) {
    console.log("No room found.");
    return;
  }
  if (Object.keys(room).length == PLAYER_LIMIT) {
    console.log("Room full. can't add this player.");
    return;
  }
  // create an id for the player
  const playerId = Math.floor(Math.random() * 10);
  // add the player to the room
  const players = { ...room, [playerId]: 0 };
  /**
   * need to take in:
   * game id (websocket)
   * player id
   * % of text completed / position
   */
  console.log(`the object looks like this: ${JSON.stringify({ ws: players })}`);
  rooms.set(ws, players);

  ws.on("data", wsMessageHandler.bind(ws));
}

function wsMessageHandler(this: Connection, msg: string) {
  //! wrong - hit redis for room id, update player's progress, send stuff to client
  const currentGame = rooms.get(this);
  if (!currentGame) {
    console.log(
      `Can't find the room for some reason. ${currentGame} | given ws: ${JSON.stringify(this)}`
    );
    return;
  }
  const parsedMsg: IPlayer = JSON.parse(msg);
  const playerId = parsedMsg.playerId;
  currentGame[playerId].progress = parsedMsg.progress;

  // get all player ids & send them to the clients
  const response = JSON.stringify({ ...currentGame });
  console.log(`The outbound message to the client: ${response}`);
  // send the new stats to each client
}

export default wssHandler;

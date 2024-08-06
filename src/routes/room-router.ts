import RoomDao from "../helpers/roomDao";
import setUserState from "../helpers/setUserState";
import { Router, type Request, type Response } from "express";
import type { IGame, IPlayer } from "../types/game-interface";
import getRandomText from "../helpers/getRandomText";

const router: Router = Router();

router.post("/create", async (req: Request, res: Response) => {
  let playerId = req.playerId;

  if (req.roomId) {
    res.setHeader("HX-Retarget", "#error");
    res.setHeader("HX-Reswap", "innerHTML");

    return res.sendStatus(422);
  } else if (!playerId) {
    playerId = setUserState(req, res, "playerId");
  }

  const roomId = setUserState(req, res, "roomId");
  const chars = playerId.split("-");
  const playerSuffix = chars[chars.length - 1];

  const host: IPlayer = {
    avatar: "./assets/icons/rocket-1.png",
    name: `Guest-${playerSuffix}`,
    progress: 0,
    host: true,
    playerId,
  };
  const text = getRandomText();
  const game: IGame = {
    text,
    finished: 0,
    started: false,
    players: [host],
    joinLink: `?room=${roomId}`,
  };
  await RoomDao.setRoom(roomId, game);

  return res.render("partials/room", {
    joinLink: game.joinLink,
    players: game.players,
    currentPlayer: host,
    text: game.text,
  });
});

router.get("/:roomId", async (req: Request, res: Response) => {
  const { roomId, playerId } = req;

  if (!roomId || !playerId) return res.sendStatus(400);

  const game = await RoomDao.getRoom(roomId);
  if (!game) return res.sendStatus(404);

  const currentPlayer = game.players.find(
    (player) => player.playerId === playerId
  );

  if (!currentPlayer) return res.sendStatus(404);

  return res.render("partials/room", {
    joinLink: game.joinLink,
    players: game.players,
    text: game.text,
    currentPlayer,
  });
});

router.post("/join/:roomId", async (req: Request, res: Response) => {
  const { playerId } = req;
  const roomId = req.params["roomId"];

  if (!roomId || !playerId) return res.sendStatus(400);

  const game = await RoomDao.getRoom(roomId);
  if (!game) return res.sendStatus(404);

  // also check if the race has started? probably set some started variable or something
  if (game.players.length === 4) return res.sendStatus(422);

  if (game.started) return res.sendStatus(422);

  const chars = playerId.split("-");
  const playerSuffix = chars[chars.length - 1];

  const newPlayer: IPlayer = {
    host: false,
    progress: 0,
    playerId: playerId,
    name: `Guest-${playerSuffix}`,
    avatar: `./assets/icons/rocket-${game.players.length + 1}.png`,
  };
  game.players.push(newPlayer);

  setUserState(req, res, "roomId", roomId);
  await RoomDao.setRoom(roomId, game);

  return res.render("partials/room", {
    // make sure the most recently joined player
    // is at the front for rendering
    players: game.players.reverse(),
    currentPlayer: newPlayer,
    joinLink: game.joinLink,
    text: game.text,
  });
});

router.post("/:roomId/start", async (req: Request, res: Response) => {
  /**
   * Host hits start
   * set started = true
   * set start time
   * let client know of start time
   * respond to host with disabled button
   * also respond with new html that contains game logic?
   * * or, once client knows start time, emit something to each player
   * * then once that event is received, ask api for new html with game logic
   */
  if (!req.playerId || !req.roomId) {
    return res.sendStatus(400);
    // .render("idk some error msg, render html or sumn");
  }

  // if the given user id is not in the room
  const room = await RoomDao.getRoom(req.roomId);
  if (!room) return res.sendStatus(400); // .render("sumn went wrong");

  const foundPlayer = room.players.find(
    (player) => player.playerId === req.playerId
  );

  if (!foundPlayer || !foundPlayer.host) return res.sendStatus(400);

  room.started = true;
  await RoomDao.setRoom(req.roomId, room);
  return res.render("partials/game");
});

export default router;

// const BadResponses = {
//   400: "Oops! Couldn't complete that request.",
//   404: "Couldn't find the requested resource.",
//   422: "The room you're trying to join may be full or in a race already.",
// };
// TODO: This is looking kinda nasty, as of now the user will have to hit /start, client will receive response, then hit ws, ws will have to map each id to thing, then respond to client, client will start the game and send updates

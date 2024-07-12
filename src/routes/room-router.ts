import clsx from "clsx/lite";
import RoomDao from "../helpers/roomDao";
import redisClient from "../config/RedisClient";
import setUserState from "../helpers/setUserState";
import { Router, type Request, type Response } from "express";
import type { IGame, IPlayer } from "../types/game-interface";

const roomDao = new RoomDao(
  process.env.NODE_ENV === "prod" ? redisClient : undefined
);

const router: Router = Router();

router.post("/create", async (req: Request, res: Response) => {
  console.log("Create ept hit");
  let playerId = req.playerId;

  if (req.roomId) {
    console.log("The player is currently in a room.");

    res.setHeader("HX-Retarget", "#error");
    res.setHeader("HX-Reswap", "innerHTML");

    return res
      .status(422)
      .send(
        `<p class=${clsx("rounded-md border bg-pink-200 text-red-400")}>The player is currently in a room.</p>`
      );
  } else if (!playerId) {
    playerId = setUserState(req, res, "playerId");
  }

  const roomId = setUserState(req, res, "roomId");
  const chars = playerId.split("-");
  const playerSuffix = chars[chars.length - 1];

  const host: IPlayer = {
    name: `Guest-${playerSuffix}`,
    client: undefined,
    progress: 0,
    host: true,
    playerId,
  };
  const text = `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam earum nihil doloremque saepe ipsum iusto, velit sequi facere! Dolor in numquam iure odit ipsam omnis eligendi, reprehenderit ipsum libero ex.`;
  const game: IGame = {
    text,
    started: false,
    players: [host],
    link: `/api/rooms/${roomId}`,
  };
  await roomDao.setRoom(roomId, game);

  // TODO: Get a text for the race. Maybe render it directly here?
  // TODO: Also need a link for this room. Render it directly here? Maybe some host specific string to stop random people from joining?
  return res.render("partials/room", {
    players: host,
    text: game.text,
    link: game.link,
  });
});

router.post("/join/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params["roomId"];
  let playerId = req.playerId;

  if (!roomId) {
    console.log(`No room id: ${roomId}`);
    return res.sendStatus(400);
  }

  if (req.roomId) {
    // remove this player from redis
    // need to? they'll be disconnected from the websocket when leaving the page
    console.log("User in a room already.");
    return;
  }

  if (!playerId) playerId = setUserState(req, res, "playerId");

  const game = await roomDao.getRoom(roomId);
  if (!game) {
    console.log("room not found.");
    return res.status(404);
    // .render("room not found");
  }

  // also check if the race has started? probably set some started variable or something
  if (game.players.length === 4) {
    console.log("room is full.");
    return res.status(500);
    // .render("room is full.");
  }

  const chars = playerId.split("-");
  const playerSuffix = chars[chars.length - 1];

  const newPlayer: IPlayer = {
    host: false,
    progress: 0,
    client: undefined,
    playerId: playerId,
    name: `Guest-${playerSuffix}`,
  };
  game.players.push(newPlayer);

  setUserState(req, res, "roomId", roomId);
  await roomDao.setRoom(roomId, game);
  return res.render("partials/room", {
    players: game.players,
    text: game.text,
    link: game.link,
  });
});

router.post("/start/:roomId", async (req: Request, res: Response) => {
  // if these values were not given
  if (!req.playerId || !req.roomId) {
    return res.status(401);
    // .render("idk some error msg, render html or sumn");
  }

  // if the given user id is not in the room
  const room = await roomDao.getRoom(req.roomId);
  if (!room) {
    return res.status(400);
    // .render("sumn went wrong");
  }

  const foundPlayer = room.players.find(
    (player) => player.playerId === req.playerId
  );

  if (!foundPlayer || !foundPlayer.host) {
    console.log("Either couldn't find the player in this room: ", room.players);
    console.log("Or this player is not the host: ");
    return res.status(400);
    // .render("sumn went wrong");
  }

  room.started = true;
  console.log("Found the player & started the game.");
  await roomDao.setRoom(req.roomId, room);
  return res.status(200);
  // host client needs to contact websocket to start the game?
});

export default router;

// TODO: This is looking kinda nasty, as of now the user will have to hit /start, client will receive response, then hit ws, ws will have to map each id to thing, then respond to client, client will start the game and send updates

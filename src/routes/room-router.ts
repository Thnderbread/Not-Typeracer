import { v4 as uuid } from "uuid";
import redisClient from "../config/RedisClient";
import { Router, type Request, type Response } from "express";
import type { IGame, IPlayer } from "../interfaces/game-interface";

const redis =
  process.env.NODE_ENV === "prod" ? redisClient : new Map<string, string>();

const router: Router = Router();

router.post("/create", async (req: Request, res: Response) => {
  // also client side create button should be disabled??
  if (req.roomId) {
    console.log("The player is currently in a room.");
    // html response here for htmx on the client??
    return res.status(400).json({ message: "You're currently in a room." });
  } else if (!req.playerId) {
    const playerId = uuid();
    res.cookie("_player", playerId, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
    });
    req.playerId = playerId;
  }

  const id = uuid();
  const roomId = id;
  res.cookie("_room", roomId, {
    secure: false,
    httpOnly: true,
    sameSite: "strict",
  });

  const { playerId } = req;
  const host: IPlayer = {
    client: undefined,
    progress: 0,
    host: true,
    playerId,
  };
  const game: IGame = { started: false, players: [host] };
  await redis.set(roomId, JSON.stringify(game));
  const stuff = await redis.get(roomId);
  console.log(stuff);
  // TODO: Get a text for the race. Maybe render it directly here?
  // TODO: Also need a link for this room. Render it directly here?
  return res.status(201);
  // .render("the created stuff");
});

// middleware for extracting room id and player id
router.post("/join/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params["roomId"];
  if (!roomId) {
    console.log(`No room id: ${roomId}`);
    return res.sendStatus(400);
  }

  // const cookies = req.cookies;
  if (req.roomId) {
    // remove this player from redis
    // need to? they'll be disconnected from the websocket when leaving the page
    console.log("User in a room already.");
    return;
  }

  if (!req.playerId) {
    console.log(`There's no player id: ${req.playerId}`);
    return;
  }

  const roomExists = await redis.get(roomId);
  if (!roomExists) {
    console.log("room not found.");
    return res.status(404);
    // .render("room not found");
  }
  const game: IGame = JSON.parse(roomExists);

  // also check if the race has started? probably set some started variable or something
  // find the number of players currently in the room; ignore the "started" property
  if (game.players.length === 4) {
    console.log("room is full.");
    return res.status(500);
    // .render("room is full.");
  }

  const newPlayer: IPlayer = {
    host: false,
    progress: 0,
    client: undefined,
    playerId: req.playerId,
  };
  game.players.push(newPlayer);

  await redis.set(roomId, JSON.stringify(game));
  return res.status(201);
  // .render("new display for each player");
});

router.post("/start/:roomId", async (req: Request, res: Response) => {
  // if these values were not given
  if (!req.playerId || !req.roomId) {
    return res.status(401);
    // .render("idk some error msg, render html or sumn");
  }

  // if the given user id is not in the room
  const roomData = await redis.get(req.roomId);
  if (!roomData) {
    return res.status(400);
    // .render("sumn went wrong");
  }

  const room: IGame = JSON.parse(roomData);
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
  await redis.set(req.roomId, JSON.stringify(room));
  return res.status(200);
  // host client needs to contact websocket to start the game?
});

export default router;

// TODO: This is looking kinda nasty, as of now the user will have to hit /start, client will receive response, then hit ws, ws will have to map each id to thing, then respond to client, client will start the game and send updates

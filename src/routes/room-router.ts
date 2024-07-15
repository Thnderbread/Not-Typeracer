import clsx from "clsx/lite";
import RoomDao from "../helpers/roomDao";
import setUserState from "../helpers/setUserState";
import { Router, type Request, type Response } from "express";
import type { IGame, IPlayer } from "../types/game-interface";

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
    avatar: "./assets/icons/rocket-1.png",
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
    joinLink: `?room=${roomId}`,
  };
  await RoomDao.setRoom(roomId, game);

  // TODO: Get a text for the race. Maybe render it directly here?
  // TODO: Also need a link for this room. Render it directly here? Maybe some host specific string to stop random people from joining?
  return res.render("partials/room", {
    joinLink: game.joinLink,
    players: game.players,
    currentPlayer: host,
    text: game.text,
  });
});

router.post("/join/:roomId", async (req: Request, res: Response) => {
  const { playerId } = req;
  const roomId = req.params["roomId"];

  if (!roomId || !playerId) {
    console.log(
      `Either no room id: ${roomId} or no player id: ${playerId}. Unable to complete the request.`
    );
    return res.sendStatus(400);
  }

  const game = await RoomDao.getRoom(roomId);
  if (!game) {
    console.log("room not found.");
    return res.sendStatus(404);
    // .render("room not found");
  }

  // also check if the race has started? probably set some started variable or something
  if (game.players.length === 4) {
    console.log("room is full.");
    return res.sendStatus(422);
    // .render("room is full.");
  }

  if (game.started) {
    console.log("Game is already in progress.");
    return res.sendStatus(422);
  }

  const chars = playerId.split("-");
  const playerSuffix = chars[chars.length - 1];

  const newPlayer: IPlayer = {
    host: false,
    progress: 0,
    client: undefined,
    playerId: playerId,
    name: `Guest-${playerSuffix}`,
    avatar: `./assets/icons/rocket-${game.players.length + 1}.png`,
  };
  game.players.push(newPlayer);

  setUserState(req, res, "roomId", roomId);
  await RoomDao.setRoom(roomId, game);

  return res.render("partials/room", {
    currentPlayer: newPlayer,
    joinLink: game.joinLink,
    players: game.players,
    text: game.text,
  });
});

router.post("/start/:roomId", async (req: Request, res: Response) => {
  if (!req.playerId || !req.roomId) {
    return res.status(400);
    // .render("idk some error msg, render html or sumn");
  }

  // if the given user id is not in the room
  const room = await RoomDao.getRoom(req.roomId);
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
  await RoomDao.setRoom(req.roomId, room);
  return res.status(200);
});

export default router;

// const BadResponses = {
//   400: "Oops! Couldn't complete that request.",
//   404: "Couldn't find the requested resource.",
//   422: "The room you're trying to join may be full or in a race already.",
// };
// TODO: This is looking kinda nasty, as of now the user will have to hit /start, client will receive response, then hit ws, ws will have to map each id to thing, then respond to client, client will start the game and send updates

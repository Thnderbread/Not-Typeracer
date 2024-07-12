import { Router, type Response } from "express";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/", async (_, res: Response) => {
  // ? if player id && room id, check redis for room,
  // ? try to connect user to room. redirect if needed
  // if (req.playerId) {
  //   if (req.roomId) {
  //     // TODO: More advanced logic for checking if player belongs in room
  //     // TODO: Maybe don't destroy stuff here, destroy it on ws side? nah
  //     // const room = await redis.get(roomId)
  //     // if room,
  //     // const game = JSON.parse(room);
  //     // if game.has(player === playerId);
  //     // const { players, text } = game;
  //     const text = `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam earum nihil doloremque saepe ipsum iusto, velit sequi facere! Dolor in numquam iure odit ipsam omnis eligendi, reprehenderit ipsum libero ex.`;
  //     const players = [
  //       { name: "Guest-1" },
  //       { name: "Guest-2" },
  //       { name: "Guest-3" },
  //       { name: "Guest-4" },
  //     ];
  //     return res.render("partials/room", { players, text });
  //   }
  //   // destroy room & player cookies - either no room id, no room found in store, or player was not a member of that room
  // }

  res.clearCookie("_room");
  res.cookie("_player", uuid(), {
    secure: false,
    httpOnly: true,
    sameSite: "strict",
  });
  res.render("index");
  res.end;
});

export default router;

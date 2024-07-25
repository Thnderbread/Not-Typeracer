import setUserState from "../helpers/setUserState";
import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Remove any previous room the user is in
  res.clearCookie("_room");
  setUserState(req, res, "playerId");

  // set room state when user is joining a room
  req.query["room"] &&
    setUserState(req, res, "roomId", req.query["room"] as string);

  return res.render("pages/index");
});

export default router;

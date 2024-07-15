import setUserState from "../helpers/setUserState";
import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Remove any previous room the user is in
  // ? check ws for user in this room?
  res.clearCookie("_room");
  setUserState(req, res, "playerId");

  // set new room state for next handler
  req.query["room"] &&
    setUserState(req, res, "roomId", req.query["room"] as string);

  return res.render("pages/index");
});

export default router;

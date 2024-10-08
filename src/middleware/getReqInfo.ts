import type { Request, Response, NextFunction } from "express";

function getReqInfo(req: Request, _: Response, next: NextFunction) {
  const cookies = req.cookies;
  req.playerId = cookies["_player"];
  req.roomId = cookies["_room"];

  next();
}

export default getReqInfo;

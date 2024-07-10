import type { Request, Response, NextFunction } from "express";

function getReqInfo(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  console.log(
    `In the /create ept, here's the cookie: ${JSON.stringify(cookies)}`
  );
  req.playerId = cookies["_player"];
  req.roomId = cookies["_room"];

  next();
}

export default getReqInfo;

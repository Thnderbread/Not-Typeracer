import type { UserState } from "../types/general";
import { v4 as uuid } from "uuid";
import { type Request, type Response } from "express";

/**
 * Creates a cookie and unique id for the user and sets it on the req object.
 * @returns the unique id generated for further use.
 */
function setUserState(
  req: Request,
  res: Response,
  cookieType: UserState,
  id = uuid()
) {
  let cookieName;
  let key: UserState;

  switch (cookieType) {
    case "playerId":
      cookieName = "_player";
      key = "playerId";
      break;
    case "roomId":
      cookieName = "_room";
      key = "roomId";
      break;
    default:
      throw new Error(`Unsupported cookie type: ${cookieType}`);
  }

  res.cookie(cookieName, id, {
    secure: false,
    httpOnly: true,
    sameSite: "strict",
  });

  req[key] = id;
  return id;
}

export default setUserState;

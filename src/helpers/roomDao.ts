import type { Redis } from "ioredis";
import RedisClient from "../config/RedisClient";
import type { IGame } from "../types/game-interface";

class RoomDao {
  conn: Redis | Map<string, string>;
  constructor(conn?: Redis) {
    this.conn = conn ? conn : new Map<string, string>();
  }

  async setRoom(roomId: string, game: IGame) {
    await this.conn.set(roomId, JSON.stringify(game));
    return;
  }

  async getRoom(roomId: string): Promise<IGame | undefined> {
    const room = await this.conn.get(roomId);
    if (!room) {
      return undefined;
    }
    const game: IGame = JSON.parse(room);
    return game;
  }
}

const dao = new RoomDao(
  process.env.NODE_ENV === "prod" ? RedisClient : undefined
);

export default dao;

// rocket-1 thing: <a href="https://www.flaticon.com/free-icons/space-shuttle" title="space shuttle icons">Space shuttle icons created by Radhe Icon - Flaticon</a>
// rocket-2: <a href="https://www.flaticon.com/free-icons/rocket" title="rocket icons">Rocket icons created by Freepik - Flaticon</a>
// rocket-3: <a href="https://www.flaticon.com/free-icons/kick-off" title="kick off icons">Kick off icons created by Yogi Aprelliyanto - Flaticon</a>
// rocket-4: <a href="https://www.flaticon.com/free-icons/mission" title="mission icons">Mission icons created by Nuricon - Flaticon</a>

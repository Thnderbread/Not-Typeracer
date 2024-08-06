import RedisClient from "../config/RedisClient";
import type { IGame } from "../types/game-interface";
import { type Redis as RedisType, Redis } from "ioredis";

class RoomDao {
  private conn: RedisType | Map<string, string>;
  constructor(conn?: RedisType) {
    this.conn = conn ? conn : new Map<string, string>();
  }

  async setRoom(roomId: string, game: IGame) {
    await this.conn.set(roomId, JSON.stringify(game));
    return;
  }

  async getRoom(roomId: string): Promise<IGame | undefined> {
    const room = await this.conn.get(roomId);
    if (!room) return undefined;
    const game: IGame = JSON.parse(room);
    return game;
  }

  async destroyRoom(roomId: string): Promise<void> {
    this.conn instanceof Redis
      ? await this.conn.del(roomId)
      : this.conn.delete(roomId);
  }
}

export default new RoomDao(
  process.env.NODE_ENV === "prod" ? RedisClient : undefined
);

// rocket-1 thing: <a href="https://www.flaticon.com/free-icons/space-shuttle" title="space shuttle icons">Space shuttle icons created by Radhe Icon - Flaticon</a>
// rocket-2: <a href="https://www.flaticon.com/free-icons/rocket" title="rocket icons">Rocket icons created by Freepik - Flaticon</a>
// rocket-3: <a href="https://www.flaticon.com/free-icons/kick-off" title="kick off icons">Kick off icons created by Yogi Aprelliyanto - Flaticon</a>
// rocket-4: <a href="https://www.flaticon.com/free-icons/mission" title="mission icons">Mission icons created by Nuricon - Flaticon</a>

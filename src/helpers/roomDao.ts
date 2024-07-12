import type { Redis } from "ioredis";
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

export default RoomDao;

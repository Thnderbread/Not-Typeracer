import { type Connection } from "sockjs";

export interface IPlayer {
  client?: Connection;
  playerId: string;
  progress: number;
  host: boolean;
}

export interface IGame {
  started: boolean;
  players: IPlayer[];
}

// export type IGame = Map<string, IPlayer[]>;

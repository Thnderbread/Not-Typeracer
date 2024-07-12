import { type Connection } from "sockjs";

export interface IPlayer {
  /** Sock.js connection */
  client?: Connection;
  /** Player's unique id */
  playerId: string;
  /** Progress made in the race */
  progress: number;
  /** Whether player is the host */
  host: boolean;
  /** Name for the player */
  name: string;
}

export interface IGame {
  /** Text used for the race */
  text: string;
  /** The link to join this game */
  link: string;
  /** Whether the race has started */
  started: boolean;
  /** All players in the room */
  players: IPlayer[];
}

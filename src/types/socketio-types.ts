import type { Socket } from "socket.io";

export interface SocketData {
  host: boolean;
  roomId: string;
  playerId: string;
}

export interface ClientToServerEvents {
  /** Triggered when the host attempts to start the game. */
  startGame: () => Promise<void>;
  /** Triggered when a player joins the websocket server. */
  join: (data: JoinEventData) => void;
  /** Triggered when a player sends their progress level to the websocket server. */
  incomingProgress: (data: IncomingProgressData) => void;
}

export interface ServerToClientEvents {
  /** Fired when a player joins or leaves a room. */
  roomChange: (player?: string) => void;
  /** Fired when the game has been started. */
  gameStarted: (startTime: number) => void;
  /** Fired when sending a player's progress level to other clients. */
  progressUpdate: (data: OutgoingProgressData) => void;
}

/** Required for correct types on the SocketIoServer & Socket objects. */
export interface InterServerEvents {}

export interface JoinEventData {
  host: boolean;
  roomId: string;
  playerId: string;
}

/** Information from a player about their progress. */
export interface IncomingProgressData {
  /** Room the player belongs to. */
  roomId: string;
  /** The player's current progress level, expressed as a percent of the entire text. */
  progress: number;
  /** The player's wpm. */
  wpm: number;
}

/** Information to be sent to all members about a player's progress. */
export interface OutgoingProgressData {
  /** The player whose progress is being updated. */
  playerId: string;
  /** The player's current progress level. */
  progress: number;
  /** How many players have finished, if any. */
  finished?: number;
  /** The player's wpm. */
  wpm: number;
}

export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

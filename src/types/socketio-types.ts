export interface SocketData {
  host: boolean;
  roomId: string;
  playerId: string;
}

export interface ClientToServerEvents {
  /** Triggered when a player joins the websocket server. */
  join: (data: JoinEventData) => void;
  /** Triggered when a player sends their progress level to the websocket server. */
  incomingProgress: (data: IncomingProgressData) => void;
}

export interface ServerToClientEvents {
  /** Fired when a player joins or leaves a room. */
  roomChange: (player?: string) => void;
  /** Fired when sending a player's progress level to other clients. */
  outgoingProgress: (data: OutgoingProgressData) => void;
}

/** Required for correct types on the SocketIoServer & Socket objects. */
export interface InterServerEvents {}

interface JoinEventData {
  roomId: string;
  playerId: string;
  playerIsHost: boolean;
}

/** Information from a player about their progress. */
interface IncomingProgressData {
  /** Room the player belongs to. */
  roomId: string;
  /** The player's current progress level. */
  progress: number;
}

/** Information to be sent to all members about a player's progress. */
export interface OutgoingProgressData {
  /** The player whose progress is being updated. */
  playerId: string;
  /** The player's current progress level. */
  progress: number;
}

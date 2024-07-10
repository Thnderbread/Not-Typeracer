declare module "express" {
  export interface Request {
    playerId?: string;
    roomId?: string;
  }
}

export {};

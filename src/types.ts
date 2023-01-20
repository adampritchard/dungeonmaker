// Game

export type TileMap = TileType[][];

export type GameMode = 'edit' | 'play';

export enum TileType {
  Floor = 0,
  Wall  = 1,
  Key   = 2,
  Door  = 3,
  Spawn = 4,
  Exit  = 5,
};

export const allTileTypes = Object.values(TileType).filter((v) => !isNaN(Number(v))) as TileType[];

// API

declare module 'iron-session' {
  interface IronSessionData {
    userId: number,
  }
}

export type ApiError = {
  error: string,
};

export type SignupReqBody = {
  username: string,
  password: string,
};

export type LoginReqBody = {
  username: string,
  password: string,
};

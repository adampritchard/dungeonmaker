export type TileMap = TileType[][];

export type GameMode = 'edit' | 'play';

export enum TileType {
  Floor = 0,
  Wall  = 1,
};

export const allTileTypes = Object.values(TileType).filter((v) => !isNaN(Number(v))) as TileType[];

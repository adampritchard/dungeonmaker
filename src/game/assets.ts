import { BaseTexture, Sprite, Texture, Rectangle } from 'pixi.js';
import { tileSize } from '@/game/main';
import { TileType } from '@/types';

type Gfx = {
  texture: Texture,
  tint: number,
};

export class Assets {
  static playerTexture: Texture;
  static playerTint = 0xFFFFFF;

  static wallTexture: Texture;
  static wallTint = 0x525252;

  static floorTexture: Texture;
  static floorTint = 0x0F0F0F;

  static keyTexture: Texture;
  static keyTint = 0xfde047;

  static doorTexture: Texture;
  static doorTint = 0x9a3412;

  static gemTexture: Texture;
  static gemTint = 0x49AEE8;

  static crateTexture: Texture;
  static crateTint = 0xd97706;

  static gfxMap: Record<TileType, Gfx>;

  public static init() {
    const spritesheet = BaseTexture.from('/sprites.png');
    
    this.floorTexture   = this.getTexture(spritesheet,  8, 2);
    this.wallTexture    = this.getTexture(spritesheet,  0, 2);
    this.keyTexture     = this.getTexture(spritesheet, 15, 4);
    this.doorTexture    = this.getTexture(spritesheet, 13, 2);
    this.playerTexture  = this.getTexture(spritesheet,  0, 3);
    this.gemTexture     = this.getTexture(spritesheet, 21, 4);
    this.crateTexture   = this.getTexture(spritesheet, 21, 2);

    this.gfxMap = {
      [TileType.Floor]: {
        texture: Assets.floorTexture,
        tint: Assets.floorTint,
      },
      [TileType.Wall]: {
        texture: Assets.wallTexture,
        tint: Assets.wallTint,
      },
      [TileType.Key]: {
        texture: Assets.keyTexture,
        tint: Assets.keyTint,
      },
      [TileType.Door]: {
        texture: Assets.doorTexture,
        tint: Assets.doorTint,
      },
      [TileType.Spawn]: {
        texture: Assets.playerTexture,
        tint: Assets.playerTint,
      },
      [TileType.Exit]: {
        texture: Assets.gemTexture,
        tint: Assets.gemTint,
      },
      [TileType.Crate]: {
        texture: Assets.crateTexture,
        tint: Assets.crateTint,
      },
    };
  }

  public static setTileGraphics(sprite: Sprite, type: TileType) {
    sprite.texture = this.gfxMap[type].texture;
    sprite.tint = this.gfxMap[type].tint;
  }

  protected static getTexture(spritesheet: BaseTexture, x: number, y: number): Texture {
    return new Texture(spritesheet, new Rectangle(tileSize * x, tileSize * y, tileSize, tileSize));
  }
}

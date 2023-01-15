import * as PIXI from 'pixi.js';
import { Application, BaseTexture, Texture, Rectangle, Sprite, FederatedPointerEvent, Graphics, Container } from 'pixi.js';
import { Dungeon } from '@prisma/client';
import { GameMode, TileMap, TileType, allTileTypes } from '@/types';

const tileSize = 8;
const scale = 4;

const initialTiles: TileMap = [
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
];

export function initGame(mount: HTMLDivElement, dungeon: Dungeon, mode: GameMode) {
  const game = new Game(dungeon, mode);
  mount.replaceChildren(game.view as any);
  return game;
}

function getTexture(spritesheet: BaseTexture, x: number, y: number): Texture {
  return new Texture(spritesheet, new Rectangle(tileSize * x, tileSize * y, tileSize, tileSize));
}

export class Game extends Application {
  public mode: GameMode;
  public tiles: TileMap;
  public player!: Sprite;
  
  private tileSprites!: Sprite[][];
  private tileGroup!: Container;

  private selectedTileType = TileType.Floor;
  // TODO: maybe make this brushBtns
  private selectedTileIndicators!: Record<TileType, Graphics>;
  private tileCursor!: Graphics;
  private mouseDrag = false;

  private wallTexture!: Texture;
  private floorTexture!: Texture;
  private keyTexture!: Texture;
  private doorTexture!: Texture;

  private keyCount = 0;

  constructor(dungeon: Dungeon, mode: GameMode) {
    super({
      width: (tileSize * 9 + 1 + (mode === 'edit' ? 20 : 0)) * scale,
      height: (tileSize * 9 + 1) * scale,
    });

    BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.stage.scale.set(scale);

    this.mode = mode;
    this.tiles = dungeon.tiles ? JSON.parse(dungeon.tiles) : initialTiles;
  
    this.initMap();
    this.initEvents();
    if (mode === 'edit') this.initToolbar();
  }

  public destroy() {
    super.destroy();
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private initMap() {
    // TODO: setup an Assets class and call Assets.init();
    const spritesheet = BaseTexture.from('/sprites.png');
    this.floorTexture   = getTexture(spritesheet,  8, 2);
    this.wallTexture    = getTexture(spritesheet,  0, 2);
    this.keyTexture     = getTexture(spritesheet, 15, 4);
    this.doorTexture    = getTexture(spritesheet, 13, 2);
    const playerTexture = getTexture(spritesheet,  0, 3);
    const gemTexture    = getTexture(spritesheet, 21, 4);

    this.tileGroup = new Container();
    this.stage.addChild(this.tileGroup);

    this.tileSprites = this.tiles.map((row, y) =>
      row.map((tile, x) =>
        this.makeTileSprite(x, y, tile)
      )
    );
  
    const exit = Sprite.from(gemTexture);
    exit.tint = 0xf43f5e;
    exit.x = tileSize * 4;
    exit.y = tileSize * 8;
    this.stage.addChild(exit);
  
    this.player = Sprite.from(playerTexture);
    this.player.x = tileSize * 4;
    this.player.y = 0
    this.stage.addChild(this.player);

    this.tileCursor = new Graphics();
    this.tileCursor.lineStyle(1, 0xFFFFFF, 0.8, 0);
    this.tileCursor.drawRect(0, 0, tileSize - 1, tileSize - 1);
    this.tileCursor.visible = false;
    this.stage.addChild(this.tileCursor);
  }

  private initEvents() {
    window.addEventListener('keydown', this.onKeyDown);

    if (this.mode === 'edit') {
      this.tileGroup.interactive = true;

      this.tileGroup.addEventListener('pointerenter', (e) => {
        this.tileCursor.visible = true;
      });

      this.tileGroup.addEventListener('pointerleave', (e) => {
        this.tileCursor.visible = false;
      });

      this.tileGroup.addEventListener('pointermove', (e) => {
        const event = e as FederatedPointerEvent;

        const posX = Math.floor((event.globalX / scale) / tileSize) * tileSize + 1;
        const posY = Math.floor((event.globalY / scale) / tileSize) * tileSize + 1;

        this.tileCursor.position.x = posX;
        this.tileCursor.position.y = posY;

        if (this.mouseDrag) {
          const tx = Math.floor((event.globalX / scale) / tileSize);
          const ty = Math.floor((event.globalY / scale) / tileSize);
          this.drawTile(tx, ty);
        }
      });

      this.tileGroup.addEventListener('pointerdown', (e) => {
        const event = e as FederatedPointerEvent;

        this.mouseDrag = true;

        const tx = Math.floor((event.globalX / scale) / tileSize);
        const ty = Math.floor((event.globalY / scale) / tileSize);
        this.drawTile(tx, ty);
      });

      this.tileGroup.addEventListener('pointerup', (e) => {
        this.mouseDrag = false;
      });
    }
  }

  private initToolbar() {
    const toolbar = new Graphics();
    toolbar.beginFill(0x999999);
    toolbar.drawRect(0, 0, 20, 9 * tileSize + 1);
    toolbar.endFill();
    toolbar.x = 9 * tileSize + 1;
    this.stage.addChild(toolbar);

    this.selectedTileIndicators = {} as Record<TileType, Graphics>;

    allTileTypes.forEach((tileType, index) => {
      const x = tileSize * 10;
      const y = 10 + (index * (tileSize + 2));

      // TODO: maybe setup a BrushBtn Sprite/Container class

      const bg = new Graphics();
      bg.beginFill(0x000000);
      bg.drawRect(0, 0, tileSize, tileSize);
      bg.endFill();
      bg.x = x;
      bg.y = y;
      this.stage.addChild(bg);

      const btn = new Sprite();
      this.setTileGraphics(btn, tileType);
      btn.x = x;
      btn.y = y;
      btn.interactive = true;
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => this.selectTileType(tileType));
      this.stage.addChild(btn);

      const indicator = new Graphics();
      indicator.lineStyle(1, 0xFFFFFF, 1, 0);
      indicator.drawRect(0, 0, tileSize, tileSize);
      indicator.x = x;
      indicator.y = y;
      indicator.visible = this.selectedTileType === tileType;
      this.stage.addChild(indicator);
      this.selectedTileIndicators[tileType] = indicator;
    });
  }

  private selectTileType(tileType: TileType) {
    this.selectedTileIndicators[this.selectedTileType].visible = false;
    this.selectedTileType = tileType;
    this.selectedTileIndicators[this.selectedTileType].visible = true;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp' || event.key === 'w') {
      this.movePlayer(this.player.x, this.player.y - tileSize);
    }

    if (event.key === 'ArrowDown' || event.key === 's') {
      this.movePlayer(this.player.x, this.player.y + tileSize);
    }

    if (event.key === 'ArrowLeft' || event.key === 'a') {
      this.movePlayer(this.player.x - tileSize, this.player.y);
    }

    if (event.key === 'ArrowRight' || event.key === 'd') {
      this.movePlayer(this.player.x + tileSize, this.player.y);
    }
  }

  private movePlayer(x: number, y: number) {
    let allowMove = false;

    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    const maxX = this.tiles[0].length;
    const maxY = this.tiles.length;

    if (tileX >= 0 && tileX < maxX && tileY >= 0 && tileY < maxY) {
      const tile = this.tiles[tileY][tileX];

      if (tile === TileType.Floor) {
        allowMove = true;
      } else if (tile === TileType.Key) {
        // Collect key.
        this.tiles[tileY][tileX] = TileType.Floor;
        this.setTileGraphics(this.tileSprites[tileY][tileX], TileType.Floor);
        this.keyCount += 1;
        allowMove = true;
      } else if (tile === TileType.Door && this.keyCount > 0) {
        // Open door.
        this.tiles[tileY][tileX] = TileType.Floor;
        this.setTileGraphics(this.tileSprites[tileY][tileX], TileType.Floor);
        this.keyCount -= 1;
        allowMove = true;
      }
    }

    if (allowMove) {
      this.player.x = x;
      this.player.y = y;
    }

    if (tileX === 4 && tileY === 8) {
      setTimeout(() => alert('you win!'), 100);
    }
  }

  private drawTile(x: number, y: number) {
    if (this.tiles[y][x] !== this.selectedTileType) {
      this.tiles[y][x] = this.selectedTileType;
      this.setTileGraphics(this.tileSprites[y][x], this.selectedTileType);
    }
  }

  private makeTileSprite(x: number, y: number, type: TileType) {
    const sprite = new Sprite();
    this.setTileGraphics(sprite, type);
    sprite.x = tileSize * x;
    sprite.y = tileSize * y;
    this.tileGroup.addChild(sprite);
    return sprite;
  }

  private setTileGraphics(sprite: Sprite, type: TileType) {
    type Gfx = { texture: Texture, tint: number };

    const gfx: Record<TileType, Gfx> = {
      [TileType.Floor]: {
        texture: this.floorTexture,
        tint: 0x0F0F0F,
      },
      [TileType.Wall]: {
        texture: this.wallTexture,
        tint: 0x525252,
      },
      [TileType.Key]: {
        texture: this.keyTexture,
        tint: 0xfde047,
      },
      [TileType.Door]: {
        texture: this.doorTexture,
        tint: 0x9a3412,
      },
    };

    sprite.texture = gfx[type].texture;
    sprite.tint = gfx[type].tint;
  }
}

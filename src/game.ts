import * as PIXI from 'pixi.js';
import { Application, BaseTexture, Container, Graphics, Sprite, Texture, Rectangle } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import type { Dungeon } from '@prisma/client';
import { TileType, allTileTypes } from '@/types';
import type { GameMode, TileMap } from '@/types';

type Direction = 'up' | 'down' | 'left' | 'right';

const tileSize = 8;
const scale = 4;

const initialTiles: TileMap = [
  [1, 1, 1, 1, 4, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 5, 1, 1, 1, 1],
];

export function initGame(mount: HTMLDivElement, dungeon: Dungeon, mode: GameMode) {
  const game = new Game(dungeon, mode);
  mount.replaceChildren(game.view as any);
  return game;
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

  private isPointerDown = false;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private pointerDownMs = 0;

  private playerTexture!: Texture;
  private wallTexture!: Texture;
  private floorTexture!: Texture;
  private keyTexture!: Texture;
  private doorTexture!: Texture;
  private gemTexture!: Texture;
  private crateTexture!: Texture;

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
    this.floorTexture   = this.getTexture(spritesheet,  8, 2);
    this.wallTexture    = this.getTexture(spritesheet,  0, 2);
    this.keyTexture     = this.getTexture(spritesheet, 15, 4);
    this.doorTexture    = this.getTexture(spritesheet, 13, 2);
    this.playerTexture  = this.getTexture(spritesheet,  0, 3);
    this.gemTexture     = this.getTexture(spritesheet, 21, 4);
    this.crateTexture   = this.getTexture(spritesheet, 21, 2);

    this.tileGroup = new Container();
    this.stage.addChild(this.tileGroup);

    // Get the spawn x,y and replace with floor tile.
    let spawnX = 0;
    let spawnY = 0;

    if (this.mode === 'play') {
      for (let y = 0; y < this.tiles.length; y += 1) {
        const row = this.tiles[y];
        for (let x = 0; x < row.length; x += 1) {
          const tile = row[x];
          if (tile === TileType.Spawn) {
            row[x] = TileType.Floor;
            spawnX = x * tileSize;
            spawnY = y * tileSize;
          }
        }
      }
    }

    this.tileSprites = this.tiles.map((row, y) =>
      row.map((tile, x) =>
        this.makeTileSprite(x, y, tile)
      )
    );

    if (this.mode === 'play') {
      this.player = Sprite.from(this.playerTexture);
      this.player.x = spawnX;
      this.player.y = spawnY;
      this.stage.addChild(this.player);
    }

    this.tileCursor = new Graphics();
    this.tileCursor.lineStyle(1, 0xFFFFFF, 0.8, 0);
    this.tileCursor.drawRect(0, 0, tileSize - 1, tileSize - 1);
    this.tileCursor.visible = false;
    this.stage.addChild(this.tileCursor);
  }

  private initEvents() {
    this.tileGroup.interactive = true;

    if (this.mode === 'play') {
      window.addEventListener('keydown', this.onKeyDown);

      this.tileGroup.addEventListener('pointerdown', (e) => {
        const event = e as FederatedPointerEvent;

        this.pointerDownX = event.globalX;
        this.pointerDownY = event.globalY;
        this.pointerDownMs = Date.now();
        this.isPointerDown = true;
      });

      const onPointerUp = (e: Event) => {
        const event = e as FederatedPointerEvent;

        const dx = event.globalX - this.pointerDownX;
        const dy = event.globalY - this.pointerDownY;
        const duration = Date.now() - this.pointerDownMs;

        this.pointerDownMs = 0;
        this.pointerDownX = 0;
        this.pointerDownY = 0;
        this.isPointerDown = false;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        const maxDurationMs = 1000;
        const distanceThreshold = 20.0;
        const minRatio = 3.0;

        if (duration < maxDurationMs) {
          if (absX > distanceThreshold && absX / absY > minRatio) {
            if (dx > 0) {
              this.movePlayer('right');
            } else {
              this.movePlayer('left');
            }
          }

          if (absY > distanceThreshold && absY / absX > minRatio) {
            if (dy > 0) {
              this.movePlayer('down');
            } else {
              this.movePlayer('up');
            }
          }
        }
      };

      this.tileGroup.addEventListener('pointerup', onPointerUp);
      this.tileGroup.addEventListener('pointerupoutside', onPointerUp);
    }

    if (this.mode === 'edit') {
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

        if (this.isPointerDown) {
          const tx = Math.floor((event.globalX / scale) / tileSize);
          const ty = Math.floor((event.globalY / scale) / tileSize);
          this.drawTile(tx, ty);
        }
      });

      this.tileGroup.addEventListener('pointerdown', (e) => {
        const event = e as FederatedPointerEvent;

        this.isPointerDown = true;

        const tx = Math.floor((event.globalX / scale) / tileSize);
        const ty = Math.floor((event.globalY / scale) / tileSize);
        this.drawTile(tx, ty);
      });

      this.tileGroup.addEventListener('pointerup', (e) => {
        this.isPointerDown = false;
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
      const y = 2 + (index * (tileSize + 2));

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
      this.movePlayer('up');
    }

    if (event.key === 'ArrowDown' || event.key === 's') {
      this.movePlayer('down');
    }

    if (event.key === 'ArrowLeft' || event.key === 'a') {
      this.movePlayer('left');
    }

    if (event.key === 'ArrowRight' || event.key === 'd') {
      this.movePlayer('right');
    }
  }

  private movePlayer(direction: Direction) {
    let allowMove = false;

    const dx: Record<Direction, number> = {
      'up':    0,
      'down':  0,
      'left':  -1,
      'right': 1,
    };

    const dy: Record<Direction, number> = {
      'up':    -1,
      'down':  1,
      'left':  0,
      'right': 0,
    };

    const nextX = this.player.x + dx[direction] * tileSize;
    const nextY = this.player.y + dy[direction] * tileSize;

    const tileX = Math.floor(nextX / tileSize);
    const tileY = Math.floor(nextY / tileSize);

    const tile = this.getTileAt(tileX, tileY);

    if (tile !== null) {
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
      } else if (tile === TileType.Crate) {
        const nextCrateTileX = tileX + dx[direction];
        const nextCrateTileY = tileY + dy[direction];
        const nextCrateTile = this.getTileAt(nextCrateTileX, nextCrateTileY);
        if (nextCrateTile === TileType.Floor) {
          // Push crate.

          // set current crate tile to floor
          this.tiles[tileY][tileX] = TileType.Floor;
          this.setTileGraphics(this.tileSprites[tileY][tileX], TileType.Floor);

          // set next crate tile to create
          this.tiles[nextCrateTileY][nextCrateTileX] = TileType.Crate;
          this.setTileGraphics(this.tileSprites[nextCrateTileY][nextCrateTileX], TileType.Crate);

          allowMove = true;
        }
      } else if (tile === TileType.Exit) {
        // Exit dungeon.
        setTimeout(() => alert('you win!'), 100);
        allowMove = true;
      }
    }

    if (allowMove) {
      this.player.x = nextX;
      this.player.y = nextY;
    }
  }

  private getTileAt(tileX: number, tileY: number): TileType|null {
    const maxX = this.tiles[0].length;
    const maxY = this.tiles.length;

    if (tileX >= 0 && tileX < maxX && tileY >= 0 && tileY < maxY) {
      return this.tiles[tileY][tileX];
    }

    return null;
  }

  private drawTile(x: number, y: number) {
    if (this.tiles[y][x] !== this.selectedTileType) {

      // Only allow one spawn.
      if (this.selectedTileType === TileType.Spawn) {
        this.replaceAllTilesOfType(TileType.Spawn, TileType.Floor);
      }

      // Only allow one exit.
      if (this.selectedTileType === TileType.Exit) {
        this.replaceAllTilesOfType(TileType.Exit, TileType.Floor);
      }

      this.tiles[y][x] = this.selectedTileType;
      this.setTileGraphics(this.tileSprites[y][x], this.selectedTileType);
    }
  }

  private replaceAllTilesOfType(from: TileType, to: TileType) {
    this.forEachTile((tile, x, y) => {
      if (tile === from) {
        this.setTileGraphics(this.tileSprites[y][x], to);
        this.tiles[y][x] = to;
      }
    });
  }

  private forEachTile(fn: (tile: TileType, x: number, y: number) => void) {
    for (let y = 0; y < this.tiles.length; y += 1) {
      const row = this.tiles[y];
      for (let x = 0; x < row.length; x += 1) {
        const tile = row[x];
        fn(tile, x, y);
      }
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

  private getTexture(spritesheet: BaseTexture, x: number, y: number): Texture {
    return new Texture(spritesheet, new Rectangle(tileSize * x, tileSize * y, tileSize, tileSize));
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
      [TileType.Spawn]: {
        texture: this.playerTexture,
        tint: 0xFFFFFF,
      },
      [TileType.Exit]: {
        texture: this.gemTexture,
        tint: 0x49AEE8,
      },
      [TileType.Crate]: {
        texture: this.crateTexture,
        tint: 0xd97706,
      },
    };

    sprite.texture = gfx[type].texture;
    sprite.tint = gfx[type].tint;
  }
}
